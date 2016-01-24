import { BB as ByteBuffer } from './subclass';
export declare function unwrapPayloads<T>(buffer: ByteBuffer | Buffer, process?: (data: Buffer) => T): T[];
export declare function wrapPayloads<T>(buffer: Buffer | Buffer[] | ByteBuffer): ByteBuffer;
export declare type InputTypes = ByteBuffer | Buffer | string | Array<ByteBuffer | Buffer | string>;
export declare function _quickCRC32(input: InputTypes, len?: number): number;
export declare function _quickCRC32(input: InputTypes, len: number, check: any): boolean;
export declare function _quickMD5Hash(value: Buffer | string): any;
