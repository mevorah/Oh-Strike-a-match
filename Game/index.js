/*jslint es5:true, nomen: true*/
'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var chat = require('./chat.js');
var game = require('./game.js');

/**
* Setup http server to listen on port 
* 3000
*/

http.listen(3000, function () {
    console.log('listening on *:3000');
});

/**
 * Use express to serve static content in
 * public folder
 */

app.use(express.static(__dirname + '/public'));

/**
 * Tell chat to listen for events
 */

chat.listen(io);

/**
 * Initialize and tell game to listen for events
 */

game.listen(io);
