var PF = require('../lib');
var net = require('net');
var tap = require('tap-stream');

net.createServer(function(r) {
    r.pipe(PF.Parser.createStream()).pipe(tap()).pipe(PF.Serializer.createStream()).pipe(r);
}).listen(8000);


