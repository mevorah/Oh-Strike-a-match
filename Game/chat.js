/*jslint es5:true */
/*global Set */
'use strict';

/**
 * chat prototype 
 */

var publics = module.exports = {};

/**
 * Define chat event types
 */

var CHAT_EVENT = {
    serverConnection: 'connection',
    clientConnection: 'clientconnect',
    serverDisconnection: 'disconnect',
    clientDisconnection: 'clientdisconnect',
    serverMessage: 'message',
    clientMessage: 'clientmessage'
};

publics.CHAT_EVENT = CHAT_EVENT;

/**
 * listen: responsible for listening to and
 * handling chat events
 *
 * @param io
 */

publics.listen = function (io) {
    var nextId, usernames;
    nextId = 0;
    usernames = new Set();
    
    io.on(CHAT_EVENT.serverConnection, function (socket) {
        var username;
        username = "user" + nextId;
        usernames.add(username);
        nextId += 1;
        
        io.emit(CHAT_EVENT.clientConnection, { usernames: Array.from(usernames) });
        
        socket.on(CHAT_EVENT.serverMessage, function (data) {
            var newMessage = data.message;
            io.emit(CHAT_EVENT.clientMessage, {user: username, message: newMessage});
        });
        
        socket.on(CHAT_EVENT.serverDisconnection, function () {
            usernames.delete(username);
            io.emit(CHAT_EVENT.clientDisconnection, { usernames: Array.from(usernames)});
        });
    });
};