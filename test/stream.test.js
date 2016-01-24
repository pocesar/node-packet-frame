'use strict';

var Lib = require('../lib');
var Parser = Lib.Parser;
var Stream = require('stream');
var Serializer = Lib.Serializer;
var expect = require('chai').expect;

describe('Stream', function () {

    describe('Serializer', function () {

        it('frames the packets', function (done) {
            var
                serializer = new Serializer(), calls = 0,
                stream = new Stream.PassThrough();

            stream.on('end', function () {
                done();
            });

            stream.on('data', function (data) {
                if (calls === 0) {
                    expect(data.toString()).to.equal('data');
                } else if (calls === 1) {
                    expect(Lib.Utils.unwrapPayloads(Lib.Subclass.wrap(data))[0].toString()).to.equal('data');
                    this.end();
                }
                calls++;
            });

            stream.pipe(serializer).pipe(stream);

            stream.write('data');
        });

    });


    describe('Parser', function () {

        it('parses perfect packet', function (done) {
            var
                parser = new Parser(), calls = 0,
                stream = new Stream.PassThrough();

            stream.on('end', function () {
                done();
            });

            stream.on('data', function (data) {
                if (calls > 1) {
                    switch (calls) {
                        case 2:
                            expect(data.toString()).to.equal('new Message text');
                            break;
                        case 3:
                            expect(data.toString()).to.equal('some text');
                            break;
                        case 4:
                            expect(data.toString()).to.equal('this is a silly message');
                            this.end();
                            break;
                    }
                }
                calls++;
            });

            stream.pipe(parser).pipe(stream);

            stream.write(Lib.Utils.wrapPayloads(new Buffer('new Message text')).toBuffer());

            stream.write(Lib.Utils.wrapPayloads([
                new Buffer('some text'),
                new Buffer('this is a silly message')
            ]).toBuffer());

        });

        it('waits on incomplete packet', function (done) {

        });

        it('drops junk packet', function (done) {

        });

    });
});