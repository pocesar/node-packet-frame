'use strict';

var Lib = require('../lib');
var Subclass = Lib.Subclass;
var expect = require('chai').expect;
var ByteBuffer = require('bytebuffer');

describe('Subclass', function () {

    it('can refresh the current length of the buffer', function () {
        var c = new Subclass(1);

        c.writeUTF8String('a', 1);
        expect(c.buffer.byteLength).to.to.equal(2);
    });

    it('inherits from bytebuffer', function () {
        expect(new Subclass).to.be.instanceof(ByteBuffer);
    });

});