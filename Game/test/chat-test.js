/*global before, beforeEach, describe, it*/
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
            
            client1 = ioc(serverAddress);
            client1.on(CHAT_EVENT.clientConnection, function (data) {
                if (data.usernames.length === 2) {
                    if (data.usernames[0] === username0 &&
                            data.usernames[1] === username1) {
                        done();
                    }
                }
            });
            
            client2 = ioc(serverAddress);
        });
    });
    
    describe('chat:disconnection', function () {
        it('should notify all users that a user has disconnected', function (done) {
            var client1, client2, connections;
            client1 = ioc(serverAddress);
            client2 = ioc(serverAddress);
            connections = 0;
            
            client1.on(CHAT_EVENT.clientConnection, function (data) {
                connections += 1;
            });
            client2.on(CHAT_EVENT.clientConnection, function (data) {
                client2.disconnect();
            });
            
            client1.on(CHAT_EVENT.clientDisconnection, function (data) {
                connections -= 1;
                if (connections === 1) {
                    done();
                }
            });
        });
        it('should send an updated list of users', function (done) {
            var client1, client2, username;
            username = "user0";
            client1 = ioc(serverAddress);
            client2 = ioc(serverAddress);
            
            client2.on(CHAT_EVENT.clientConnection, function (data) {
                client2.disconnect();
            });
            
            client1.on(CHAT_EVENT.clientDisconnection, function (data) {
                var numUsers = data.usernames !== undefined ?
                            data.usernames.length : 0;
                if (numUsers === 1 &&
                        data.usernames[0] === username) {
                    done();
                }
            });
        });
    });
    
    describe('chat:message', function () {
        it('should send message to all users', function (done) {
            var client1, client2, message, messagesReceived, completeCallback;
            client1 = ioc(serverAddress);
            client2 = ioc(serverAddress);
            message = "Cactus";
            messagesReceived = [];
            
            completeCallback = function () {
                if (messagesReceived.length === 2) {
                    if (messagesReceived[0] === message &&
                            messagesReceived[1] === message) {
                        done();
                    }
                }
            };
            
            client1.emit(CHAT_EVENT.serverMessage, {message: message});
            client1.on(CHAT_EVENT.clientMessage, function (data) {
                messagesReceived.push(data.message);
                completeCallback();
            });
            
            client2.on(CHAT_EVENT.clientMessage, function (data) {
                messagesReceived.push(data.message);
                completeCallback();
            });
             
        });
        
        it('should include who sent the message', function (done) {
            var client1, username, message;
            client1 = ioc(serverAddress);
            username = "user0";
            message = "Canyon";
            
            client1.emit(CHAT_EVENT.serverMessage, {message: message});
            client1.on(CHAT_EVENT.clientMessage, function (data) {
                if (username === data.user) {
                    done();
                }
            });
        });
    });
});