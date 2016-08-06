/*global describe, it*/
'use strict';

var assert = require('chai').assert;
var scorer = require('../scorer.js');

describe('scorer.js', function () {
    describe('scorer:getScore', function () {
        it('should return 0 when the user answers incorrectly', function () {
            var anyTime, correctAnswers, userWrongAnswers, score;
            anyTime = 9;
            correctAnswers = ["correctAnswerA", "correctAnswerB"];
            userWrongAnswers = ["wrongAnswerA", "wrongAnswerB"];
            
            score = scorer.getScore(anyTime, anyTime, userWrongAnswers, correctAnswers);
            
            assert(score === 0);
        });
        
        it('should return 0 when the number of selected doesn\'t equal the number of answers', function () {
            var anyTime, correctAnswers, userWrongAnswers, score;
            anyTime = 9;
            correctAnswers = ["correctAnswerA", "correctAnswerB", "correctAnswerC"];
            userWrongAnswers = ["wrongAnswerA", "wrongAnswerB"];

            score = scorer.getScore(anyTime, anyTime, userWrongAnswers, correctAnswers);
            
            assert(score === 0);
        });
        
        it('should return the ceil of 1000 * (reactionTime/roundTime)', function () {
            var reactionTime, roundTime, correctAnswers, userCorrectAnswers, score;
            reactionTime = 5;
            roundTime = 10;
            correctAnswers = ["correctAnswerA", "correctAnswerB"];
            userCorrectAnswers = ["correctAnswerA", "correctAnswerB"];
            
            score = scorer.getScore(reactionTime, roundTime, userCorrectAnswers, correctAnswers);
            
            assert(score === 500);
        });
    });
});