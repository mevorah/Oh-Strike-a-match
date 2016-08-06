/*global before, describe, it*/
'use strict';

var chat = require('../chat.js');
var CHAT_EVENT = chat.CHAT_EVENT;
var assert = require('chai').assert;
var app = require('express')();
var http = require('http').Server(app);
var ios = require('socket.io')(http);
var ioc = require('socket.io-client');

var testPort = 7326;
var serverAddress = 'http://localhost:' + testPort;

describe('chat.js', function () {
    
    before(function () {
        http.listen(testPort);
        chat.listen(ios);
    });
    
    describe('chat:connection', function () {
        it('should notify all users, including connector, that a new user joined', function () {
            var client1, client2, numNotifications;
            numNotifications = 0;
  
            client1 = ioc(serverAddress);
            client1.on(CHAT_EVENT.clientConnection, function (data) {
                numNotifications += 1;
            });
            
            client2 = ioc(serverAddress);
            
            assert(numNotifications === 2);
        });
        
        it('should send some username in connection message', function () {
            var client1, client2, username;
            
            username = "";
            
            client1 = ioc(serverAddress);
            client1.on(CHAT_EVENT.clientConnection, function (data) {
                username = data.username;
            });
            
            client2 = ioc(serverAddress);
            
            assert(username.length > 0);
        });
    });
    
    describe('chat:message', function () {
        it('should send message to all users', function () {
            assert(1 === 2);
        });
    });
});












