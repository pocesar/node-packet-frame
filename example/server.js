var PF = require('../lib');
var net = require('net');
var tap = require('tap-stream');

net.createServer(function(r) {
    r.pipe(new PF.Parser).pipe(tap()).pipe(new PF.Serializer).pipe(r);
}).listen(8000);


