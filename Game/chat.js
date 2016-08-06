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
    clientConnection: 'connection'
};

publics.CHAT_EVENT = CHAT_EVENT;

/**
 * listen: responsible for listening to and
 * handling chat events
 *
 * @param io
 */

publics.listen = function (io) {
    io.on(CHAT_EVENT.serverConnection, function (socket) {
        console.log("hello");
        
        io.emit(CHAT_EVENT.clientConnection, {});
    });
};