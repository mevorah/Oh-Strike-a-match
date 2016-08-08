/*global before, describe, it, Set*/
'use strict';

var assert = require('chai').assert;
var roundbuilder = require('../roundBuilder.js');

describe('roundBuilder.js', function () {
    describe('roundbuilder:buildRound6Choose2', function () {
        var validSeed, validData;
    
        validSeed = 2;
        validData = [
            ['theme0', 'option00', 'option01', 'option02', 'option03'],
            ['theme1', 'option10', 'option11', 'option12', 'option13'],
            ['theme2', 'option20', 'option21', 'option22', 'option23'],
            ['theme3', 'option30', 'option31', 'option32', 'option33'],
            ['theme4', 'option40', 'option41', 'option42', 'option43']
        ];
        
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
    
    describe('roundbuilder:buildRounds', function () {
        
        var validRoundBreakdown, validSeed, validData;
    
        validRoundBreakdown = {
            sixChoose2: 0,
            tenChoose3: 0,
            sixteenSplit2: 0
        };
        
        validSeed = 2;
        
        validData = [
            ['theme0', 'option00', 'option01', 'option02', 'option03'],
            ['theme1', 'option10', 'option11', 'option12', 'option13'],
            ['theme2', 'option20', 'option21', 'option22', 'option23'],
            ['theme3', 'option30', 'option31', 'option32', 'option33'],
            ['theme4', 'option40', 'option41', 'option42', 'option43'],
            ['theme5', 'option50', 'option51', 'option52', 'option53'],
            ['theme6', 'option60', 'option61', 'option62', 'option63'],
            ['theme7', 'option70', 'option71', 'option72', 'option73'],
            ['theme8', 'option80', 'option81', 'option82', 'option83'],
            ['theme9', 'option90', 'option91', 'option92', 'option93'],
            ['themeA', 'optionA0', 'optionA1', 'optionA2', 'optionA3'],
            ['themeB', 'optionB0', 'optionB1', 'optionB2', 'optionB3'],
            ['themeC', 'optionC0', 'optionC1', 'optionC2', 'optionC3'],
            ['themeD', 'optionD0', 'optionD1', 'optionD2', 'optionD3'],
            ['themeE', 'optionE0', 'optionE1', 'optionE2', 'optionE3'],
            ['themeF', 'optionF0', 'optionF1', 'optionF2', 'optionF3']
        ];
        
        it('should throw a TypeError if data is not of type array', function () {
            var badData, caught, rounds;
            caught = false;
            badData = "string";
            
            try {
                rounds = roundbuilder.buildRounds(validRoundBreakdown, validSeed, badData);
            } catch (e) {
                caught = true;
                assert(e.name === 'TypeError');
            }
            
            if (!caught) {
                assert(false);
            }
            
        });
        describe('should throw InsufficientDataError if data.length < numRounds * roundType requirements', function () {
            it('sixChoose2:requires 5 datum', function () {
                var roundBreakdown, caught, rounds;
                caught = false;
                roundBreakdown = {
                    sixChoose2: 10,
                    tenChoose3: 0,
                    sixteenSplit2: 0
                };
                
                try {
                    rounds = roundbuilder.buildRounds(roundBreakdown, validSeed, validData);
                } catch (e) {
                    caught = true;
                    assert(e.name === 'InsufficientDataError');
                }
                
                if (!caught) {
                    assert(false);
                }
            });
            it('tenChoose3:requires 7 datum', function () {
                var roundBreakdown, caught, rounds;
                caught = false;
                roundBreakdown = {
                    sixChoose2: 0,
                    tenChoose3: 10,
                    sixteenSplit2: 0
                };
                
                try {
                    rounds = roundbuilder.buildRounds(roundBreakdown, validSeed, validData);
                } catch (e) {
                    caught = true;
                    assert(e.name === 'InsufficientDataError');
                }
                
                if (!caught) {
                    assert(false);
                }
            });
            it('sixteenSplit2:requires 8 datum', function () {
                var roundBreakdown, caught, rounds;
                caught = false;
                roundBreakdown = {
                    sixChoose2: 0,
                    tenChoose3: 0,
                    sixteenSplit2: 10
                };
                
                try {
                    rounds = roundbuilder.buildRounds(roundBreakdown, validSeed, validData);
                } catch (e) {
                    caught = true;
                    assert(e.name === 'InsufficientDataError');
                }
                
                if (!caught) {
                    assert(false);
                }
            });
        });
        it('should throw BadArgumentError if roundBreakdown does not contain 6 choose 2', function () {
            var badRoundBreakdown, caught, rounds;
            caught = false;
            badRoundBreakdown = {
                tenChoose3: 0,
                sixteenSplit2: 0
            };
            
            try {
                rounds = roundbuilder.buildRounds(badRoundBreakdown, validSeed, validData);
            } catch (e) {
                caught = true;
                assert(e.name === 'BadArgumentError');
            }
            
            if (!caught) {
                assert(false);
            }
        });
        it('should throw BadArgumentError if roundBreakdown does not contain 10 choose 3', function () {
            var badRoundBreakdown, caught, rounds;
            caught = false;
            badRoundBreakdown = {
                sixChoose2: 0,
                sixteenSplit2: 0
            };
            
            try {
                rounds = roundbuilder.buildRounds(badRoundBreakdown, validSeed, validData);
            } catch (e) {
                caught = true;
                assert(e.name === 'BadArgumentError');
            }
            
            if (!caught) {
                assert(false);
            }
        });
        it('should throw BadArgumentError if roundBreakdown does not contain 16 split 2', function () {
            var badRoundBreakdown, caught, rounds;
            caught = false;
            badRoundBreakdown = {
                sixChoose2: 0,
                tenChoose3: 0
            };
            
            try {
                rounds = roundbuilder.buildRounds(badRoundBreakdown, validSeed, validData);
            } catch (e) {
                caught = true;
                assert(e.name === 'BadArgumentError');
            }
            
            if (!caught) {
                assert(false);
            }
        });
        it('should return an array of rounds', function () {
            var rounds;
            rounds = roundbuilder.buildRounds(validRoundBreakdown, validSeed, validData);
            assert(rounds instanceof Array);
        });
        it('should throw a TypeError if seed is not of type number', function () {
            var badSeed, caught, rounds;
            caught = false;
            badSeed = "string";
            
            try {
                rounds = roundbuilder.buildRounds(validRoundBreakdown, badSeed, validData);
            } catch (e) {
                caught = true;
                assert(e.name === 'TypeError');
            }
            
            if (!caught) {
                assert(false);
            }
        });
        it('should index into data seed % data.length', function () {
            var rounds, roundBreakdown, seed, round1;
            roundBreakdown = {
                sixChoose2: 1,
                tenChoose3: 0,
                sixteenSplit2: 0
            };
            seed = 4;
            
            rounds = roundbuilder.buildRounds(roundBreakdown, seed, validData);
            
            round1 = rounds[0];
            //8 - index 4 in to start the five. Index 4 again within
            //the five
            assert('theme8' === round1.answer.theme);
        });
        describe('should pass sections based on what the round requires', function () {
            it('sixChoose2: chunks of five', function () {
                var rounds, roundBreakdown, seed, round1, round2;
                roundBreakdown = {
                    sixChoose2: 2,
                    tenChoose3: 0,
                    sixteenSplit2: 0
                };
                seed = 0;
                rounds = roundbuilder.buildRounds(roundBreakdown, seed, validData);
                
                round1 = rounds[0];
                assert('theme0' === round1.answer.theme);
                
                round2 = rounds[1];
                assert('theme5' === round2.answer.theme);
            });
            it('should allow wrapping around data', function () {
                var rounds, roundBreakdown, seed, round1, round2;
                roundBreakdown = {
                    sixChoose2: 2,
                    tenChoose3: 0,
                    sixteenSplit2: 0
                };
                seed = 10;
                rounds = roundbuilder.buildRounds(roundBreakdown, seed, validData);
                
                round1 = rounds[0];
                assert('themeA' === round1.answer.theme);
                
                round2 = rounds[1];
                assert('themeF' === round2.answer.theme);
            });
            it('tenChoose3: chunks of seven', function () {
                var rounds, roundBreakdown, seed, round1, round2;
                roundBreakdown = {
                    sixChoose2: 0,
                    tenChoose3: 2,
                    sixteenSplit2: 0
                };
                seed = 0;
                rounds = roundbuilder.buildRounds(roundBreakdown, seed, validData);
                
                round1 = rounds[0];
                assert('theme0' === round1.answer.theme);
                
                round2 = rounds[1];
                assert('theme7' === round2.answer.theme);
            });
            it('sixteenSplit2: chunks of eight', function () {
                var rounds, roundBreakdown, seed, round1, round2;
                roundBreakdown = {
                    sixChoose2: 0,
                    tenChoose3: 0,
                    sixteenSplit2: 2
                };
                seed = 0;
                rounds = roundbuilder.buildRounds(roundBreakdown, seed, validData);
                
                round1 = rounds[0];
                assert('theme0' === round1.answer.theme);
                
                round2 = rounds[1];
                assert('theme8' === round2.answer.theme);
            });
        });
        
    });
});











