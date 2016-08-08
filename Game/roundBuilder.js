'use strict';

/**
 * round prototype 
 */

var publics = module.exports = {};

/**
 * round breakown prototype
 */

publics.RoundBreakdown = {
    sixChoose2: {
        required: 5
    },
    tenChoose3: {
        required: 7
    },
    sixteenSplit2: {
        required: 8
    }
};

var RoundBreakdown = publics.RoundBreakdown;

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
    var rounds, numData, numDataRequired, indexStart, indexEnd, i, round, roundData;
    
    // input validation
    if (!(data instanceof Array)) {
        throw {
            name: 'TypeError',
            message: 'Requires data to be of type array. Found:' + typeof data
        };
    }
    if (typeof seed !== 'number') {
        throw {
            name: 'TypeError',
            message: 'Requires seed to be of type number. Found:' + typeof seed
        };
    }
    if (roundBreakdown.sixChoose2 === undefined ||
            roundBreakdown.tenChoose3 === undefined ||
            roundBreakdown.sixteenSplit2 === undefined) {
        throw {
            name: 'BadArgumentError',
            message: 'Round breakdown requires sixChoose2, tenChoose3, and sixteenSplit2 members'
        };
    }
    
    numData = data.length;
    numDataRequired = roundBreakdown.sixChoose2 * RoundBreakdown.sixChoose2.required +
        roundBreakdown.tenChoose3 * RoundBreakdown.tenChoose3.required +
        roundBreakdown.sixteenSplit2 * RoundBreakdown.sixteenSplit2.required;
    
    if (numDataRequired > numData) {
        throw {
            name: 'InsufficientDataError',
            message: 'Required data:' + numDataRequired + ', Found:' + numData
        };
    }
    
    // build rounds
    rounds = [];
    indexStart = seed;
    
    for (i = 0; i < roundBreakdown.sixChoose2; i += 1) {
        indexEnd = (indexStart + RoundBreakdown.sixChoose2.required) % data.length;
        roundData = data.slice(indexStart, indexEnd);
        round = this.buildRound6Choose2(seed, roundData);
        indexStart = indexEnd;
        rounds.push(round);
    }
    
    return rounds;
};