'use strict';

var Lib = require('../lib');
var expect = require('chai').expect;

describe('utils', function () {

    describe('_quickMD5Hash', function () {

        it('string hashes', function () {
            expect(Lib.Utils._quickMD5Hash('a')).to.equal('0cc175b9c0f1b6a831c399e269772661');
            expect(Lib.Utils._quickMD5Hash('abc')).to.equal('900150983cd24fb0d6963f7d28e17f72');
            expect(Lib.Utils._quickMD5Hash('message digest')).to.equal('f96b697d7cb7938d525a2f31aaf161d0');
        });

    });

    describe('_quickCRC32', function () {

        it('can hash a string', function () {
            expect(Lib.Utils._quickCRC32('a')).to.equal(3904355907);
        });

        it('can hash a buffer', function () {
            expect(Lib.Utils._quickCRC32(new Buffer(['a'.charCodeAt(), 'b'.charCodeAt(), 'c'.charCodeAt()]))).to.equal(891568578);
        });

        it('can hash a ByteBuffer', function () {
            var a = new Lib.Subclass(1);

            a.writeUTF8String('123').reset();

            expect(Lib.Utils._quickCRC32(a)).to.equal(2286445522);
        });

        it('can make a check on existing hash', function () {
            expect(Lib.Utils._quickCRC32('a', 1, 3904355907)).to.equal(true);
            expect(Lib.Utils._quickCRC32(new Buffer('a'), 1, 3904355907)).to.equal(true);
            expect(Lib.Utils._quickCRC32(Lib.Subclass.allocate(1).writeUTF8String('a'), 1, 3904355907)).to.equal(true);
        });

    });

    describe('wrapPayloads', function () {

        it('wraps many payloads', function () {
            var wrapped = Lib.Utils.wrapPayloads([
                new Buffer('anyone there?'),
                new Buffer('hello?')
            ]);

            expect(wrapped.buffer.byteLength).to.equal(22);
        });

        it('throws error when invalid data is passed', function () {
            expect(function () {
                Lib.Utils.wrapPayloads('a');
            }).to.throw(/input needs to be either a Buffer or ByteBuffer/);
        });

    });

    describe('unwrapPayloads', function () {

        it('unwraps a payload with a header', function () {
            var wrapped = Lib.Utils.wrapPayloads(new Buffer('hello'));

            var unwrapped = Lib.Utils.unwrapPayloads(wrapped)[0];

            expect(unwrapped.toString()).to.equal('hello');

        })

        it('throws on non bytebuffer', function () {
            expect(function () {
                Lib.Utils.unwrapPayloads(['a']);
            }).to.throw(/unwrapPayloads expect a ByteBuffer/);
        });

        it('can unwrap many messages', function () {
            //Proto.Magic.debug = true;

            var wrapped = Lib.Utils.wrapPayloads([
                new Buffer('hello'),
                new Buffer('there'),
                new Buffer('freezing here')
            ]);

            var unwrapped = Lib.Utils.unwrapPayloads(wrapped);

            expect(unwrapped).to.have.length(3);

            for (var i = 0; i < unwrapped.length; i++) {

                switch (i) {
                    case 0:
                        expect(unwrapped[i].toString()).to.equal('hello');
                        break;
                    case 1:
                        expect(unwrapped[i].toString()).to.equal('there');
                        break;
                    case 2:
                        expect(unwrapped[i].toString()).to.equal('freezing here');
                        break;
                }
            }
        });

        it('can unwrap many messages amidst corrupt data', function () {
            var wrapped = Lib.Utils.wrapPayloads([
                new Buffer('working'),
                new Buffer('working as well')
            ]), junk = Lib.Subclass.wrap(new Buffer([2, 2, 1, 2, 3, 1, 2, 3, 1, 3, 1, 23, 1, 2, 32, 1, 2, 3]), 'binary');

            wrapped.prepend(junk);
            wrapped.append(junk, 66);

            var messages = Lib.Utils.unwrapPayloads(wrapped);

            expect(messages).to.have.length(2);

            expect(messages[0].toString()).to.equal('working');
            expect(messages[1].toString()).to.equal('working as well');
        });

        it('just ignore corrupt packets', function () {
            var wrapped = Lib.Utils.wrapPayloads(new Buffer('testing'));

            Lib.Magic.instance.version(wrapped, Lib.Magic.instance.magicVersion ^ 0xC0); //corrupt version

            expect(Lib.Utils.unwrapPayloads(wrapped)).to.have.length(0);

            Lib.Magic.instance.version(wrapped, true); // restore version
            var originalLength = Lib.Magic.instance.size(wrapped); // store original length
            Lib.Magic.instance.size(wrapped, 90);// corrupt payload length

            expect(Lib.Utils.unwrapPayloads(wrapped)).to.have.length(0);

            Lib.Magic.instance.size(wrapped, originalLength); //restore payload length
            Lib.Magic.instance.headerChecksum(wrapped, new Lib.Subclass(13));// corrupt header checksum

            expect(Lib.Utils.unwrapPayloads(wrapped)).to.have.length(0);
        });

        it('ignore garbage data', function () {
            expect(Lib.Utils.unwrapPayloads((new Lib.Subclass(80000)).writeUTF8String('dfgstcfsrtcsdrsdrtv'))).to.have.length(0);
        });

    });
});

