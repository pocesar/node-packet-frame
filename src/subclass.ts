'use strict';

import ByteBuffer = require('bytebuffer');

var debug = require('debug')('packet-frame:subclass');

export class BB extends ByteBuffer {
    constructor(capacity?: number, littleEndian?: boolean, noAssert?: boolean) {
        super(capacity, littleEndian, noAssert);
    }

    printDebug(out?: ( text: string ) => void ): void {
        super.printDebug(debug);
    }

    readBytes(length?: number, offset?: number) {
        length = length !== void 0 ? length : this.limit;
        offset = offset !== void 0 ? offset : (this.offset += length) - length;

        var out = <BB>(new (<any>this).constructor(length, this.littleEndian));
        for (var i = 0; i < length; i++) {
            out.writeByte(this.readByte(offset + i));
        }
        out.flip();

        return out;
    }

    refresh(toBegin: boolean = false) {
        this.resize((typeof this.buffer === 'undefined' || this.buffer === null) ? 0 : this.limit);
        if (toBegin === true) {
            this.offset = 0;
        }
        return this;
    }

    private static _patch(instance: any): BB {
        instance.readBytes = this.prototype.readBytes;
        instance.refresh = this.prototype.refresh;
        instance.printDebug = this.prototype.printDebug;
        return instance;
    }

    static allocate( capacity?: number, littleEndian?: number, noAssert?: boolean ): BB {
        return this._patch(<any>super.allocate(capacity, littleEndian, noAssert));
    }

    static wrap( buffer: ByteBuffer | Buffer | ArrayBuffer | Uint8Array | string | Array<number>, enc?: string | boolean, littleEndian?: boolean, noAssert?: boolean ): BB {
        return this._patch(<any>super.wrap(buffer, enc, littleEndian, noAssert));
    }

    static concat( buffers: Array<ByteBuffer | Buffer |  ArrayBuffer | Uint8Array | string>, encoding?: string | boolean, litteEndian?: boolean, noAssert?: boolean ): BB {
        return this._patch(<any>super.concat(buffers, encoding, litteEndian, noAssert));
    }

}