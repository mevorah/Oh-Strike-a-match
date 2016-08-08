/*global before, describe, it, Set*/
'use strict';

var assert = require('chai').assert;
var roundbuilder = require('../roundBuilder.js');

describe('roundBuilder.js', function () {
    var validSeed, validData;
    
    validSeed = 2;
    validData = [
        ['theme0', 'option00', 'option01', 'option02', 'option03'],
        ['theme1', 'option10', 'option11', 'option12', 'option13'],
        ['theme2', 'option20', 'option21', 'option22', 'option23'],
        ['theme3', 'option30', 'option31', 'option32', 'option33'],
        ['theme4', 'option40', 'option41', 'option42', 'option43']
    ];
    
    describe('roundbuilder:buildRound6Choose2', function () {
        it('should return an object with 6 options', function () {
            var round;
            round = roundbuilder.buildRound6Choose2(validSeed, validData);
            assert(6 === round.options.length);
        });
        it('should return an object with an answer', function () {
            var round;
            round = roundbuilder.buildRound6Choose2(validSeed, validData);
            assert(undefined !== round.answer);
        });
        it('should have an answer with two options', function () {
            var round;
            round = roundbuilder.buildRound6Choose2(validSeed, validData);
            assert(undefined !== round.answer.options);
            assert(2 === round.answer.options.length);
        });
        it('should have an answer with a theme', function () {
            var round;
            round = roundbuilder.buildRound6Choose2(validSeed, validData);
            assert(undefined !== round.answer.theme);
        });
        it('should throw a TypeError if seed is not a number', function () {
            var badSeed, round, caught;
            caught = false;
            badSeed = "string";
            try {
                round = roundbuilder.buildRound6Choose2(badSeed, validData);
            } catch (e) {
                caught = true;
                assert(e.name === 'TypeError');
            }
            
            if (!caught) {
                assert(true === false);
            }
        });
        it('should throw a TypeError if data is not an array', function () {
            var badData, round, caught;
            badData = "string";
            caught = false;
            try {
                round = roundbuilder.buildRound6Choose2(validSeed, badData);
            } catch (e) {
                caught = true;
                assert(e.name === 'TypeError');
            }
            
            if (!caught) {
                assert(true === false);
            }
        });
        it('should throw a BadArgumentError if data is not an array of length 5', function () {
            var badData, round, caught;
            badData = [1, 2, 3];
            caught = false;
            
            try {
                round = roundbuilder.buildRound6Choose2(validSeed, badData);
            } catch (e) {
                caught = true;
                assert(e.name === 'BadArgumentError');
            }
            
            if (!caught) {
                assert(true === false);
            }
        });
        it('should select an answer from data index based on the data.length % seed', function () {
            var seed, round;
            seed = 2;
            round = roundbuilder.buildRound6Choose2(seed, validData);
            assert('theme2' === round.answer.theme);
        });
        it('should select options from datum index based on options.length % seed', function () {
            var seed, round;
            seed = 3;
            round = roundbuilder.buildRound6Choose2(seed, validData);
            assert('option33' === round.answer.options[0]);
            assert('option30' === round.answer.options[1]);
        });
        it('should populate 6 options from remaining data based on options.length % seed', function () {
            var seed, round, optionSet;
            seed = 2;
            round = roundbuilder.buildRound6Choose2(validSeed, validData);

            optionSet = new Set(round.options);
            assert(optionSet.has('option02'));
            assert(optionSet.has('option12'));
            assert(optionSet.has('option32'));
            assert(optionSet.has('option42'));
        });
        it('should have the 2 answer options in the 6 options', function () {
            var seed, round, optionSet;
            seed = 2;
            round = roundbuilder.buildRound6Choose2(validSeed, validData);

            optionSet = new Set(round.options);
            assert(optionSet.has('option22'));
            assert(optionSet.has('option23'));
        });
    });
});











