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
    clientConnection: 'clientConnect'
};

publics.CHAT_EVENT = CHAT_EVENT;

/**
 * listen: responsible for listening to and
 * handling chat events
 *
 * @param io
 */

publics.listen = function (io) {
    var nextId = 0;
    
    io.on(CHAT_EVENT.serverConnection, function (socket) {
        var username = "user" + nextId;
        nextId += 1;
        
        io.emit(CHAT_EVENT.clientConnection, { username:username} );        
    });
};