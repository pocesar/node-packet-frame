'use strict';

import { inherits } from 'util';
import { createHash } from 'crypto';
import * as Magic from './magic';
import { BB as ByteBuffer } from './subclass';

var debug = require('debug')('packet-frame:utils');

var CRC32Table: number[] = (function() {
    var c: number;
    var n: number;
    var crcTable: number[] = [];

    for (n = 0; n < 256; n++) {
        c = n;
        for (var k = 0; k < 8; k++) {
            c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    return crcTable;
})();

export function unwrapPayloads<T>(buffer: ByteBuffer | Buffer, process?: (data: Buffer) => T) {
    var out: T[] = [], payload: Magic.AllSet<T>;

    if (Buffer.isBuffer(buffer)) {
        buffer = ByteBuffer.wrap(buffer);
    }

    if (ByteBuffer.isByteBuffer(buffer)) {
        buffer.mark(0);

        if (buffer.buffer.byteLength > Magic.instance.sizeofHeader) {
            while (buffer.buffer.byteLength - buffer.markedOffset > 0) {
                if ((payload = Magic.instance.getAll<T>(buffer))) {
                    out.push(process ? process(<any>payload.data) : payload.data);
                    buffer.mark(buffer.markedOffset + payload.size + Magic.instance.sizeofHeader);
                } else {
                    buffer.mark(buffer.markedOffset + 1);
                }
            }
        }
    }

    return out;
}

export function wrapPayloads<T>(buffer: Buffer | Buffer[] | ByteBuffer): ByteBuffer {
    if (Array.isArray(buffer)) {
        var b = new ByteBuffer(Magic.instance.sizeofHeader * (<Buffer[]>buffer).length);

        (<Buffer[]>buffer).forEach(function(buf) {
            b.append(wrapPayloads(buf));
        });

        b.compact();

        return b;
    } else {
        if (ByteBuffer.isByteBuffer(buffer)) {
            buffer = (<any>(<ByteBuffer>buffer).toBuffer());
        }

        var dataBuffer = new ByteBuffer(Magic.instance.sizeofHeader + (<Buffer>buffer).length);

        Magic.instance.setAll<T>(dataBuffer, (<Buffer>buffer), (<Buffer>buffer).length);

        return dataBuffer;
    }
}

export type InputTypes = ByteBuffer | Buffer | string | Array<ByteBuffer | Buffer | string>;

export function _quickCRC32(input: InputTypes, len?: number): number;
export function _quickCRC32(input: InputTypes, len: number, check: any): boolean;
export function _quickCRC32(input: InputTypes, len?: number, check?: any): any {
    var crc: number;
    var result: number;

    if (Buffer.isBuffer(input) || typeof input === 'string') {
        input = ByteBuffer.wrap(<any>input);
    }

    if (ByteBuffer.isByteBuffer(input)) {
        //input.refresh(true);

        if (!len) {
            len = input.buffer.byteLength;
        }
    } else {
        throw new Error('input needs to be either a Buffer, ByteBuffer or string');
    }

    crc = 0 ^ (-1);

    for (var i = 0; i < len; i++) {
        crc = (crc >>> 8) ^ CRC32Table[(crc ^ ((<ByteBuffer>input).readUint8(i))) & 0xFF];
    }

    result = (crc ^ (-1)) >>> 0;

    return check === void 0 ? result : result === check;
}

export function _quickMD5Hash(value: Buffer | string) {
    return createHash('md5').update(value).digest('hex');
}

