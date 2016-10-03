'use strict';

var port = 9091;

var express     = require('express');

    express()
    .use(express.static('./public'))
    .listen(port);

    console.log('open browser at : http://localhost:' + port);

