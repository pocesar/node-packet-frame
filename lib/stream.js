'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var stream = require('stream');
var subclass_1 = require('./subclass');
var utils_1 = require('./utils');
var Magic = require('./magic');
var debug = require('debug')('packet-frame:stream');
var Parser = (function (_super) {
    __extends(Parser, _super);
    function Parser(options) {
        if (options === void 0) { options = {}; }
        _super.call(this, options);
        this.buffer = new Buffer(0);
    }
    Parser.prototype._transform = function (chunk, encoding, done) {
        this.buffer = Buffer.concat([this.buffer, chunk]);
        var bb = subclass_1.BB.wrap(this.buffer);
        if (Magic.instance.version(bb)) {
            var unwrapped = utils_1.unwrapPayloads(chunk);
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
    };
    Parser.prototype._flush = function (cb) {
        this.buffer = null;
        cb();
    };
    return Parser;
})(stream.Transform);
exports.Parser = Parser;
var Serializer = (function (_super) {
    __extends(Serializer, _super);
    function Serializer(options) {
        if (options === void 0) { options = {}; }
        options.objectMode = false;
        _super.call(this, options);
    }
    Serializer.prototype._transform = function (chunk, encoding, done) {
        this.push(utils_1.wrapPayloads(chunk).toBuffer());
        done();
    };
    Serializer.prototype._flush = function (cb) {
        cb();
    };
    return Serializer;
})(stream.Transform);
exports.Serializer = Serializer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyZWFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3N0cmVhbS50cyJdLCJuYW1lcyI6WyJQYXJzZXIiLCJQYXJzZXIuY29uc3RydWN0b3IiLCJQYXJzZXIuX3RyYW5zZm9ybSIsIlBhcnNlci5fZmx1c2giLCJTZXJpYWxpemVyIiwiU2VyaWFsaXplci5jb25zdHJ1Y3RvciIsIlNlcmlhbGl6ZXIuX3RyYW5zZm9ybSIsIlNlcmlhbGl6ZXIuX2ZsdXNoIl0sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7Ozs7OztBQUViLElBQVksTUFBTSxXQUFNLFFBQ3hCLENBQUMsQ0FEK0I7QUFDaEMseUJBQWlDLFlBQVksQ0FBQyxDQUFBO0FBQzlDLHNCQUE2QyxTQUM3QyxDQUFDLENBRHFEO0FBQ3RELElBQVksS0FBSyxXQUFNLFNBQVMsQ0FBQyxDQUFBO0FBRWpDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBRXBEO0lBQTRCQSwwQkFBZ0JBO0lBR3hDQSxnQkFBWUEsT0FBcUNBO1FBQXJDQyx1QkFBcUNBLEdBQXJDQSxZQUFxQ0E7UUFDN0NBLGtCQUFNQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUVmQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxJQUFJQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNoQ0EsQ0FBQ0E7SUFFREQsMkJBQVVBLEdBQVZBLFVBQVdBLEtBQWFBLEVBQUVBLFFBQWdCQSxFQUFFQSxJQUFjQTtRQUV0REUsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFFbERBLElBQUlBLEVBQUVBLEdBQUdBLGFBQVVBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1FBRXRDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxPQUFPQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM3QkEsSUFBSUEsU0FBU0EsR0FBR0Esc0JBQWNBLENBQWFBLEtBQUtBLENBQUNBLENBQUNBO1lBRWxEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbkJBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLEdBQUdBLEdBQUdBLFNBQVNBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBLEdBQUdBLEdBQUdBLEVBQUVBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBO29CQUNuREEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ3ZDQSxDQUFDQTtZQUNMQSxDQUFDQTtZQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxZQUFZQSxJQUFJQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbENBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLEVBQUVBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBO1lBQ3JEQSxDQUFDQTtRQUNMQSxDQUFDQTtRQUVEQSxJQUFJQSxFQUFFQSxDQUFDQTtJQUNYQSxDQUFDQTtJQUVERix1QkFBTUEsR0FBTkEsVUFBT0EsRUFBWUE7UUFDZkcsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFFbkJBLEVBQUVBLEVBQUVBLENBQUNBO0lBQ1RBLENBQUNBO0lBQ0xILGFBQUNBO0FBQURBLENBQUNBLEFBckNELEVBQTRCLE1BQU0sQ0FBQyxTQUFTLEVBcUMzQztBQXJDWSxjQUFNLFNBcUNsQixDQUFBO0FBRUQ7SUFBZ0NJLDhCQUFnQkE7SUFDNUNBLG9CQUFZQSxPQUFxQ0E7UUFBckNDLHVCQUFxQ0EsR0FBckNBLFlBQXFDQTtRQUM3Q0EsT0FBT0EsQ0FBQ0EsVUFBVUEsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFFM0JBLGtCQUFNQSxPQUFPQSxDQUFDQSxDQUFDQTtJQUNuQkEsQ0FBQ0E7SUFFREQsK0JBQVVBLEdBQVZBLFVBQVdBLEtBQWFBLEVBQUVBLFFBQWdCQSxFQUFFQSxJQUFjQTtRQUN0REUsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0Esb0JBQVlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBLENBQUNBO1FBRTFDQSxJQUFJQSxFQUFFQSxDQUFDQTtJQUNYQSxDQUFDQTtJQUVERiwyQkFBTUEsR0FBTkEsVUFBT0EsRUFBWUE7UUFDZkcsRUFBRUEsRUFBRUEsQ0FBQ0E7SUFDVEEsQ0FBQ0E7SUFDTEgsaUJBQUNBO0FBQURBLENBQUNBLEFBaEJELEVBQWdDLE1BQU0sQ0FBQyxTQUFTLEVBZ0IvQztBQWhCWSxrQkFBVSxhQWdCdEIsQ0FBQSJ9