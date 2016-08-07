/*global before, describe, it*/
'use strict';

var assert = require('chai').assert;
var app = require('express')();
var http = require('http').Server(app);
var IOServer = require('socket.io');
var ioc = require('socket.io-client');

var CHAT_EVENT = require('../chat.js').CHAT_EVENT;

var testPort = 7326;
var serverAddress = 'http://localhost:' + testPort;
var testTimeOut = 2000; //ms

describe('chat.js', function () {
    
    var ios, chat;
    
    beforeEach(function () {
        http.listen(testPort);
        console.log("hello");
        chat = require('../chat.js');
        ios = new IOServer(http);
        chat.listen(ios);   
    });
    
    describe('chat:connection', function () {
        it('should notify all users, including connector, that a new user joined', function (done) {
            var client1, client2, numNotifications;
            numNotifications = 0;
  
            client1 = ioc(serverAddress);
            client1.on(CHAT_EVENT.clientConnection, function () {
                numNotifications += 1;
                
                if (numNotifications === 2) {
                    done();
                }
            });
            
            client2 = ioc(serverAddress);
        });
        
        it('should send enumerated username in connection message', function (done) {
            var client1, client2, username0, username1, usernames;
            username0 = "user0";
            username1 = "user1";
            usernames = [];
            
            client1 = ioc(serverAddress);
            client1.on(CHAT_EVENT.clientConnection, function (data) {
                console.log(data);
                usernames.push(data.username);
                if (usernames.length === 2) {
                    if (usernames[0] === username0 &&
                       (usernames[1] === username1)) {
                        done();
                    }
                }
            });
            
            client2 = ioc(serverAddress);
        });
    });
    
   /* describe('chat:message', function () {
        it('should send message to all users', function () {
            assert(1 === 2);
        });
    }); */
});












