var assert = require('chai').assert;
var scorer = require('../Scorer.js');

describe('Scorer', function() {
    describe('Scorer:getScore', function() {
        it('should return 0 when the user answers incorrectly', function() {
            var anyTime = 9;
            var correctAnswers = ["correctAnswerA", "correctAnswerB"];
            var userWrongAnswers = ["wrongAnswerA", "wrongAnswerB"];
            
            var score = scorer.getScore(anyTime, anyTime, userWrongAnswers, correctAnswers);
            
            assert(score == 0);
        });
        
        it('should return 0 when the number of selected doesn\'t equal the number of answers', function() {
            var anyTime = 9;
            var correctAnswers = ["correctAnswerA", "correctAnswerB", "correctAnswerC"];
            var userWrongAnswers = ["wrongAnswerA", "wrongAnswerB"];            

            var score = scorer.getScore(anyTime, anyTime, userWrongAnswers, correctAnswers);
            
            assert(score == 0);
        });
        
        it('should return the ceil of 1000 * (reactionTime/roundTime)', function() {
            var reactionTime = 5;
            var roundTime = 10;

            var correctAnswers = ["correctAnswerA", "correctAnswerB"];
            var userCorrectAnswers = ["correctAnswerA", "correctAnswerB"];
            
            var score = scorer.getScore(reactionTime, roundTime, userCorrectAnswers, correctAnswers);
            
            assert(score == 500);
        });
    });
});