import { BB as ByteBuffer } from './subclass';
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
export declare class Magic {
    debug: boolean;
    magicVersion: number;
    sizeofHeader: number;
    MAX_SIZE: number;
    _sizes: {
        [fn: string]: Sizes;
    };
    constructor(debug?: boolean, magicVersion?: number);
    getOffset(buffer: ByteBuffer, offset?: number): number;
    version(buffer: ByteBuffer, version?: number | boolean): number;
    /**
     * Compare the versions
     */
    checkVersion(buffer: ByteBuffer, version?: number): boolean;
    dataChecksum(buffer: ByteBuffer, data?: Buffer, length?: number): number;
    checkDataCS(buffer: ByteBuffer, len?: number, chksum?: number): ByteBuffer;
    size(buffer: ByteBuffer, length?: number): number;
    headerChecksum(buffer: ByteBuffer, header?: ByteBuffer): number;
    checkHeaderCS(buffer: ByteBuffer, chksum?: number): boolean;
    payload(buffer: ByteBuffer, data: Buffer, length?: number): number;
    getAll<T>(buffer: ByteBuffer): AllSet<T>;
    setAll<T>(dataBuffer: ByteBuffer, data: Buffer, length?: number): AllSet<T>;
}
export declare var instance: Magic;
