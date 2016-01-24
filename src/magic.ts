'use strict';

import { _quickCRC32 } from './utils';
import { BB as ByteBuffer } from './subclass';

var debug = require('debug')('packet-frame:magic');

export interface Sizes {
    size: number;
    offset: number;
}

export interface AllSet<T> {
    version: number;
    dataChecksum: number;
    size: number;
    headerChecksum: number;
    data?: T;
}

var SizeOffset = function(size: number, offset: number): MethodDecorator {
    return function <T>(target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) {
        var sizes: Sizes = {
            size: size,
            offset: offset
        };

        if (!('_sizes' in target)) {
            target['_sizes'] = {}
        }

        target['_sizes'][propertyKey] = sizes;

        return descriptor;
    }
}

export class Magic {
    public sizeofHeader: number = 0;
    public MAX_SIZE: number = 0;
    public _sizes: { [fn: string]: Sizes };

    constructor(public debug: boolean = false, public magicVersion: number = 0x02) {

        this.sizeofHeader = (() => {
            var total = 0;
            for (var i in this._sizes) {
                total += this._sizes[i].size;
            }
            return total;
        })();

        this.MAX_SIZE = (() => {
            return this.sizeofHeader + Math.pow(2, this._sizes['size'].size * 8);
        })();
    }

    getOffset(buffer: ByteBuffer, offset?: number) {
        if (buffer.markedOffset > -1) {
            return buffer.markedOffset + offset;
        } else {
            return offset;
        }
    }

    @SizeOffset(1, 0)
    version(buffer: ByteBuffer, version?: number | boolean): number {
        var offset: number = this._sizes['version'].offset;
        buffer.offset += this._sizes['version'].size;
        if (version !== void 0) {
            version = version === true ? this.magicVersion : version;
            buffer.writeUint8(<number>version, offset);
            return <number>version;
        } else {
            try {
                return buffer.readUint8(this.getOffset(buffer, offset));
            } catch (e) {
                /*istanbul ignore next:not needed to be tested*/
                if (this.debug) {
                    throw e;
                }
            }
            return null;
        }
    }

    /**
     * Compare the versions
     */
    checkVersion(buffer: ByteBuffer, version?: number) {
        return this.version(buffer) === (version || this.magicVersion);
    }

    @SizeOffset(4, 1)
    dataChecksum(buffer: ByteBuffer, data?: Buffer, length?: number) {
        var offset: number = this._sizes['dataChecksum'].offset;
        buffer.offset += this._sizes['dataChecksum'].size;

        if (data !== void 0) {
            var hash = _quickCRC32(data, length);
            buffer.writeUint32(hash, offset);
            return hash;
        } else {
            try {
                return buffer.readUint32(this.getOffset(buffer, offset));
            } catch (e) {
                /*istanbul ignore next:not needed to be tested*/
                if (this.debug) {
                    throw e;
                }
            }
            return null;
        }
    }

    checkDataCS(buffer: ByteBuffer, len?: number, chksum?: number) {
        var length = len || this.size(buffer);

        if (!length || length > (buffer && buffer.limit)) {
            return null;
        }
        var data: ByteBuffer;
        try {
            data = buffer.readBytes(length, this.getOffset(buffer, this.sizeofHeader));
        } catch (e) {
            /*istanbul ignore next:not needed to be tested*/
            if (this.debug) {
                throw e;
            }
            return null;
        }
        return _quickCRC32(data, len, chksum || this.dataChecksum(buffer, null, len)) && data;
    }

    @SizeOffset(2, 5)
    size(buffer: ByteBuffer, length?: number): number {
        var offset = this._sizes['size'].offset;
        buffer.offset += this._sizes['size'].size;
        if (length !== void 0) {
            buffer.writeUint16(length, offset);
            return length;
        } else {
            try {
                return buffer.readUint16(this.getOffset(buffer, offset));
            } catch (e) {
                /*istanbul ignore next:not needed to be tested*/
                if (this.debug) {
                    throw e;
                }
            }
            return null;
        }
    }

    @SizeOffset(4, 7)
    headerChecksum(buffer: ByteBuffer, header?: ByteBuffer): number {
        var offset = this._sizes['headerChecksum'].offset;
        buffer.offset += this._sizes['headerChecksum'].size;
        if (header) {
            var len = this.sizeofHeader - this._sizes['headerChecksum'].size;
            var hash = _quickCRC32(header.readBytes(len, 0), len);
            buffer.writeUint32(hash, offset);
            return hash;
        } else {
            try {
                return buffer.readUint32(this.getOffset(buffer, offset));
            } catch (e) {
                /*istanbul ignore next:not needed to be tested*/
                if (this.debug) {
                    throw e;
                }
            }
            return null;
        }
    }

    checkHeaderCS(buffer: ByteBuffer, chksum?: number) {
        var header: ByteBuffer;
        try {
            var len = this.sizeofHeader - this._sizes['headerChecksum'].size;
            header = buffer.readBytes(len, this.getOffset(buffer, 0));
        } catch (e) {
            /*istanbul ignore next:not needed to be tested*/
            if (this.debug) {
                throw e;
            }
            return null;
        }
        return _quickCRC32(header, header.limit, chksum || this.headerChecksum(buffer));
    }

    payload(buffer: ByteBuffer, data: Buffer, length?: number) { // append at the end of the sizeOfHeader
        var offset = this.sizeofHeader;
        length = length || (data && data.length);
        try {
            if (this.size(buffer, length)) {
                buffer.offset += length;
                buffer.append(data, offset);
            } else {
                return null;
            }
        } catch (e) {
            /*istanbul ignore next:not needed to be tested*/
            if (this.debug) {
                throw e;
            }
            return null;
        }
        return length;
    }

    getAll<T>(buffer: ByteBuffer): AllSet<T> {
        var version: number = this.version(buffer);

        if (version !== this.magicVersion) {
            /*istanbul ignore next:not needed to be tested*/
            if (this.debug) {
                buffer.printDebug();
                throw new Error('Version mismatch ' + version + ' != ' + this.magicVersion);
            }
            return null;
        }

        var headerChecksum = this.headerChecksum(buffer);

        if (!this.checkHeaderCS(buffer, headerChecksum)) {
            /*istanbul ignore next:not needed to be tested*/
            if (this.debug) {
                buffer.printDebug();
                throw new Error('Invalid header checksum ' + headerChecksum);
            }
            return null;
        }

        var size = this.size(buffer);

        if (!size) {
            /*istanbul ignore next:not needed to be tested*/
            if (this.debug) {
                buffer.printDebug();
                throw new Error('Invalid length ' + size);
            }
            return null;
        }

        var dataChecksum = this.dataChecksum(buffer, null, size);

        if (!dataChecksum) {
            /*istanbul ignore next:not needed to be tested*/
            if (this.debug) {
                buffer.printDebug();
                throw new Error('Invalid data checksum ' + dataChecksum);
            }
            return null;
        }

        var data = this.checkDataCS(buffer, size, dataChecksum);

        if (!data) {
            /*istanbul ignore next:not needed to be tested*/
            if (this.debug) {
                buffer.printDebug();
                throw new Error('Invalid data');
            }
            return null;
        }

        return {
            version: version,
            dataChecksum: dataChecksum,
            headerChecksum: headerChecksum,
            size: size,
            data: (<any>data)
        };
    }

    setAll<T>(dataBuffer: ByteBuffer, data: Buffer, length?: number): AllSet<T> {
        if (!data || !dataBuffer) {
            throw new Error('Empty data');
        }

        if ((length || data.length) > this.MAX_SIZE) {
            throw new Error('Packet MAX_SIZE is ' + this.MAX_SIZE + ' bytes');
        }

        if ((length || data.length) <= 0) {
            throw new Error('Invalid data length of ' + (length || data.length) + ' bytes');
        }

        dataBuffer.mark(0).reset();

        var version = this.version(dataBuffer, true);
        var dataChecksum = this.dataChecksum(dataBuffer, data, length);
        var size = this.payload(dataBuffer, data, length);
        var headerChecksum = this.headerChecksum(dataBuffer, dataBuffer);

        dataBuffer.compact();

        return {
            version: <number>version,
            dataChecksum: dataChecksum,
            size: size,
            headerChecksum: headerChecksum
        };
    }
}

export var instance = new Magic();
