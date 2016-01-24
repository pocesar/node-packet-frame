'use strict';

import * as stream from 'stream'
import { BB as ByteBuffer } from './subclass';
import { wrapPayloads, unwrapPayloads } from './utils'
import * as Magic from './magic';

var debug = require('debug')('packet-frame:stream');

export class Parser extends stream.Transform {
    public buffer: Buffer;

    constructor(options: stream.TransformOptions = {}) {
        super(options);

        this.buffer = new Buffer(0);
    }

    static createStream(options?: stream.TransformOptions) {
        return new this(options);
    }

    _transform(chunk: Buffer, encoding: string, done: Function) {

        this.buffer = Buffer.concat([this.buffer, chunk]);

        var bb = ByteBuffer.wrap(this.buffer);

        if (Magic.instance.version(bb)) {
            var unwrapped = unwrapPayloads<ByteBuffer>(chunk);

            if (unwrapped.length) {
                for (var i = 0, len = unwrapped.length; i < len; i++) {
                    this.push(unwrapped[i].toBuffer());
                }
            }

            if (bb.markedOffset >= chunk.length) {
                this.buffer = this.buffer.slice(bb.markedOffset);
            }
        }

        done();
    }

    _flush(cb: Function) {
        this.buffer = null;

        cb();
    }
}

export class Serializer extends stream.Transform {
    constructor(options: stream.TransformOptions = {}) {
        options.objectMode = false;

        super(options);
    }

    static createStream(options?: stream.TransformOptions) {
        return new this(options);
    }

    _transform(chunk: Buffer, encoding: string, done: Function) {
        this.push(wrapPayloads(chunk).toBuffer());

        done();
    }

    _flush(cb: Function) {
        cb();
    }
}