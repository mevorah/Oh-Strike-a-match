/*global Set*/
'use strict';

/**
 * scorer prototype 
 */

var publics = module.exports = {};

/**
 * getScore: responsible for calculating a round score
 *
 * @param reactionTime
 * @param roundTime
 * @param userAnswers
 * @param correctAnswers
 */

publics.getScore = function (reactionTime, roundTime, userAnswers, correctAnswers) {
    var userAnswerSet, correctAnswerSet, userIsIncorrect, roundScore;
    
    if (userAnswers.length !== correctAnswers.length) {
        return 0;
    }
    
    userAnswerSet = new Set(userAnswers);
    correctAnswerSet = new Set(correctAnswers);
    userIsIncorrect = false;
    
    userAnswers.forEach(function (userAnswer) {
        if (!correctAnswerSet.has(userAnswer)) {
            userIsIncorrect = true;
        }
    });
        
    if (userIsIncorrect) {
        return 0;
    }
    
    roundScore = Math.ceil(1000 * (reactionTime / roundTime));
    
    return roundScore;
};


