var PF = require('../lib');
var net = require('net');
var tap = require('tap-stream');

var client = net.connect(8000, 'localhost', function(r){

});

client.on('data', function(data) {

});