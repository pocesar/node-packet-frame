'use strict';

var Lib = require('../lib');
var Magic = Lib.Magic;
var expect = require('chai').expect;
var sinon = require('sinon');

describe('Magic', function () {

    beforeEach(function () {
        this.b = new Lib.Subclass(0);
    });

    it('set and check the version', function () {
        var v = Magic.instance.version(this.b, true);

        expect(Magic.instance.checkVersion(this.b)).to.equal(true);
        expect(Magic.instance.version(this.b)).to.equal(v);
    });

    it('set and check header checksum', function () {
        var chksum = Magic.instance.headerChecksum(this.b, this.b);

        expect(Magic.instance.headerChecksum(this.b)).to.equal(chksum);
        expect(Magic.instance.checkHeaderCS(this.b, chksum)).to.equal(true);
        expect(Magic.instance.checkHeaderCS(this.b)).to.equal(true);
    });

    it('set and check data checksum', function () {
        var data = new Lib.Subclass(4);

        data.append('data').refresh(true);

        Magic.instance.payload(this.b, data, data.length);

        var chksum = Magic.instance.dataChecksum(this.b, data);
        this.b.refresh(true);

        expect(Magic.instance.checkDataCS(this.b)).to.not.be(false);
        expect(Magic.instance.checkDataCS(this.b, 4)).to.not.be(false);
        expect(Magic.instance.checkDataCS(this.b, 4, chksum)).to.not.be(false);
        expect(Magic.instance.checkDataCS(this.b)).to.eql(data);
    });

    it('payload with invalid data', function () {
        expect(Magic.instance.payload(this.b)).to.equal(null);
    });

    it('set and get size', function () {
        Magic.instance.size(this.b, 4);
        expect(Magic.instance.size(this.b)).to.equal(4);
    });

    it('all magic functions and getAll', function () {
        var data = new Lib.Subclass();
        data.writeUTF8String('test!').flip();

        expect(function () {
            Magic.instance.setAll();
        }).to.throw(/Empty data/);

        var b = Magic.instance.setAll(this.b, data);

        expect(Magic.instance.getAll(this.b)).to.eql({
            data: data,
            size: b.size,
            headerChecksum: b.headerChecksum,
            dataChecksum: b.dataChecksum,
            version: b.version
        });
    });

    it('wrong length fails', function () {
        var data = new Lib.Subclass(1);
        data.writeUTF8String('test').flip();

        Magic.instance.setAll(this.b, data, data.length);

        expect(Magic.instance.checkDataCS(this.b, 5)).to.equal(null);
    });

    it('getAll return null on invalid packet', function () {
        Magic.instance.setAll(this.b, 'data');

        this.b.writeUint16(0, Magic.instance.size._offset);

        //Magic.instance.debug = true;

        sinon.stub(Magic.instance, 'checkHeaderCS', function () { return true; });

        var all = Magic.instance.getAll(this.b);

        expect(all).to.equal(null);
        this.b.writeUint16(4, Magic.instance.size._offset);

        this.b.writeUint32(0xDEADBEEF, Magic.instance.dataChecksum._offset);

        all = Magic.instance.getAll(this.b);
        expect(all).to.equal(null);

        this.b.writeUint32(0, Magic.instance.dataChecksum._offset);

        all = Magic.instance.getAll(this.b);
        expect(all).to.equal(null);

        Magic.instance.checkHeaderCS.restore();
    });

    it('corrupted packet return null', function () {
        var data = new Lib.Subclass(1);
        data.writeCString('test').flip();

        Magic.instance.setAll(this.b, data, data.length);

        var array = this.b.array;

        this.b.array = null;

        expect(Magic.instance.version(this.b)).to.equal(null);
        expect(Magic.instance.headerChecksum(this.b)).to.equal(null);
        expect(Magic.instance.dataChecksum(this.b)).to.equal(null);
        expect(Magic.instance.size(this.b)).to.equal(null);
        expect(Magic.instance.checkHeaderCS(this.b)).to.equal(null);
        expect(Magic.instance.checkDataCS(this.b)).to.equal(null);
        expect(Magic.instance.payload('fake', ' ', 2)).to.equal(null);
    });

    it('throw for packets zero byte or bigger than MAX_SIZE', function () {
        var b = this.b;
        expect(function () {
            Magic.instance.setAll(b, Lib.Subclass.allocate(0));
        }).to.throw(/Invalid data length of 0 bytes/);

        expect(function () {
            Magic.instance.setAll(b, Lib.Subclass.wrap(new Buffer(Magic.instance.MAX_SIZE + 1), 'binary'));
        }).to.throw(new RegExp('Packet MAX_SIZE is ' + Magic.instance.MAX_SIZE + ' bytes'));
    });

    afterEach(function () {
        this.b = null;
    });

});

