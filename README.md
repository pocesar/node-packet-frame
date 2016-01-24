[![Build Status](https://travis-ci.org/pocesar/node-packet-frame.png?branch=master)](https://travis-ci.org/pocesar/node-packet-frame)
[![Coverage Status](https://coveralls.io/repos/pocesar/node-packet-frame/badge.svg?branch=master&service=github)](https://coveralls.io/github/pocesar/node-packet-frame?branch=master)
[![Dependency Status](https://david-dm.org/pocesar/node-packet-frame.svg?theme=shields.io)](https://david-dm.org/pocesar/node-packet-frame)

[![NPM](https://nodei.co/npm/packet-frame.png?downloads=true&stars=true)](https://nodei.co/npm/packet-frame/)

Packet Frame
===========

Easy streaming packet framing and serialization.

# Install

```bash
npm install packet-frame
```

# What?

Framing a packet means wrapping the payload with a header and checksums to ensure they are valid, and having it's size set.

The frames are limited to 65k (uint16), a "magic" version is added, along with CRC32 to the header and to the payload, recursively.

You can choose to drop invalid payloads, or deal with it manually.

# How?

```es6
import { Streams } from 'packet-frame'

var stream = new Streams.Parser({
    policy: 'drop' // default
})

net.createServer((socket) => {
    socket.pipe(stream).pipe(socket); // only the valid data is echoed back
})
```

# License

MIT