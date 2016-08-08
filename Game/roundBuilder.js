'use strict';

/**
 * round prototype 
 */

var publics = module.exports = {};

/**
 * buildRound6Choose2: returns a round with 6 options, 2
 * correct options, 1 correct answer
 * 
 * @param seed
 * @param data [[theme:theme,option0:option0,...,option4:option4](5)]
 * @return round
 * @throws TypeError
 * @throws BadArgumentError
 */

publics.buildRound6Choose2 = function (seed, data) {
    var round, i, answerIndex, answerData, optionIndex1, optionIndex2, option, datum;
    
    if (!(data instanceof Array)) {
        throw {
            name: 'TypeError',
            message: 'Requires data to be of type array. Found:' + typeof data
        };
    }
    if (data.length !== 5) {
        throw {
            name: 'BadArgumentError',
            message: 'Requires that the data array have 5 datum. Found:' + data.length
        };
    }
    if (typeof seed !== 'number') {
        throw {
            name: 'TypeError',
            message: 'Requires seed to be of type number. Found:' + typeof seed
        };
    }
        
    round = {
        options: [],
        answer: {
            options: [],
            theme: ""
        }
    };
    
    answerIndex = seed % data.length;
    answerData = data[answerIndex];
    round.answer.theme = answerData[0];

    optionIndex1 = seed % (answerData.length - 1);
    round.answer.options.push(answerData[1 + optionIndex1]);
    round.options.push(answerData[1 + optionIndex1]);
    
    optionIndex2 = (seed + 1) % (answerData.length - 1);
    round.answer.options.push(answerData[1 + optionIndex2]);
    round.options.push(answerData[1 + optionIndex2]);
        
    for (i = 0; i < 5; i += 1) {
        if (i !== answerIndex) {
            datum = data[i];
            round.options.push(datum[1 + optionIndex1]);
        }
    }
    
    return round;
};

/**
 * buildRounds: responsible for creating a collection
 * of rounds.
 *
 * @param roundBreakdown
 * @param seed
 * @param data
 * @return List<round>
 */

publics.buildRounds = function (roundBreakdown, seed, data) {
    
};