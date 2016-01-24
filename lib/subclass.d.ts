import ByteBuffer = require('bytebuffer');
export declare class BB extends ByteBuffer {
    constructor(capacity?: number, littleEndian?: boolean, noAssert?: boolean);
    printDebug(out?: (text: string) => void): void;
    readBytes(length?: number, offset?: number): BB;
    refresh(toBegin?: boolean): this;
    private static _patch(instance);
    static allocate(capacity?: number, littleEndian?: number, noAssert?: boolean): BB;
    static wrap(buffer: ByteBuffer | Buffer | ArrayBuffer | Uint8Array | string | Array<number>, enc?: string | boolean, littleEndian?: boolean, noAssert?: boolean): BB;
    static concat(buffers: Array<ByteBuffer | Buffer | ArrayBuffer | Uint8Array | string>, encoding?: string | boolean, litteEndian?: boolean, noAssert?: boolean): BB;
}
