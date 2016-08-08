/*global before, describe, it*/
'use strict';

var assert = require('chai').assert;
var chat = require('../game.js');

/*describe('game.js', function() {
    describe('game:connection', function() {
        it('should ...', function() {
            assert(1 === 2);
        });
    });
});*/



/*

- Game starting state
-- Creates a room for new game
- Multiple games
- Creating round object
- Sending different state
    - Idle
    - Game start
    - round
    - next round
    - end
- Round
    - Sending question
    - Sending answer
    - Ends after timeout
- Ending a game
- Different rounds
*/