import * as stream from 'stream';
export declare class Parser extends stream.Transform {
    buffer: Buffer;
    constructor(options?: stream.TransformOptions);
    _transform(chunk: Buffer, encoding: string, done: Function): void;
    _flush(cb: Function): void;
}
export declare class Serializer extends stream.Transform {
    constructor(options?: stream.TransformOptions);
    _transform(chunk: Buffer, encoding: string, done: Function): void;
    _flush(cb: Function): void;
}
