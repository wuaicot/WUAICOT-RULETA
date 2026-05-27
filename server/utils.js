"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENTS = exports.calculateWin = exports.calculateLineNumbers = exports.calculateWinners = exports.getRandomNumber = exports.resetBoard = exports.isUserDataUnique = exports.isIdUnique = void 0;
const utils_1 = require("../client/src/common/utils");
const isIdUnique = (array, id) => {
    return array.every((item) => item.playerId !== id);
};
exports.isIdUnique = isIdUnique;
const isUserDataUnique = (uniqueData, usersData) => {
    // Use a copy to avoid in-place reverse bug
    const reversedData = [...usersData].reverse();
    for (const data of reversedData) {
        if ((0, exports.isIdUnique)(uniqueData, data.playerId)) {
            uniqueData.push(data);
        }
    }
};
exports.isUserDataUnique = isUserDataUnique;
const resetBoard = (winners, uniqueData, usersData) => {
    winners.forEach((winner) => (winner.win = 0));
    uniqueData.length = 0;
    usersData.length = 0;
};
exports.resetBoard = resetBoard;
const getRandomNumber = (min, max) => {
    const minValue = Math.ceil(min);
    const maxValue = Math.floor(max);
    return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
};
exports.getRandomNumber = getRandomNumber;
const calculateWinners = (winners, uniqueData, winningNumber) => {
    for (let i = 0; i < uniqueData.length; i++) {
        for (let j = 0; j < winners.length; j++) {
            if (uniqueData[i].playerId === winners[j].playerId) {
                winners[j].win = (0, exports.calculateWin)(winningNumber, uniqueData[i].bets);
            }
        }
    }
};
exports.calculateWinners = calculateWinners;
var BetTypes;
(function (BetTypes) {
    BetTypes["NUMBER"] = "number";
    BetTypes["ZERO"] = "zero";
    BetTypes["BLACK"] = "black";
    BetTypes["RED"] = "red";
    BetTypes["EVEN"] = "even";
    BetTypes["ODD"] = "odd";
    BetTypes["FIRST_LINE"] = "first_line";
    BetTypes["SECOND_LINE"] = "second_line";
    BetTypes["THIRD_LINE"] = "third_line";
    BetTypes["NUMBERS_1_18"] = "numbers_1_18";
    BetTypes["NUMBERS_19_36"] = "numbers_19_36";
    BetTypes["NUMBERS_1_12"] = "numbers_1_12";
    BetTypes["NUMBERS_2_12"] = "numbers_2_12";
    BetTypes["NUMBERS_3_12"] = "numbers_3_12";
})(BetTypes || (BetTypes = {}));
const getBetType = (betSpot) => {
    switch (betSpot) {
        case '1ST12':
            return 'numbers_1_12';
            break;
        case '2ND12':
            return 'numbers_2_12';
            break;
        case '3RD12':
            return 'numbers_3_12';
            break;
        case '1TO18':
            return 'numbers_1_18';
            break;
        case '19TO36':
            return 'numbers_19_36';
            break;
        case '2TO1_1':
            return 'first_line';
            break;
        case '2TO1_2':
            return 'second_line';
            break;
        case '2TO1_3':
            return 'third_line';
            break;
        case 'RED':
            return 'red';
            break;
        case 'BLACK':
            return 'black';
            break;
        case 'EVEN':
            return 'even';
            break;
        case 'ODD':
            return 'odd';
            break;
        case '0':
            return 'zero';
            break;
        default:
            return 'number';
    }
};
const calculateLineNumbers = (line) => {
    const lineNumbersArray = [];
    let currentNumber = line.includes('first')
        ? 1
        : line.includes('second')
            ? 2
            : 3;
    for (let i = currentNumber; i <= 36; i += 3) {
        lineNumbersArray.push(i);
    }
    return lineNumbersArray;
};
exports.calculateLineNumbers = calculateLineNumbers;
const calculateWin = (winningNumber, bets) => {
    let win = 0;
    const userBets = bets;
    for (let i = 0; i < userBets.length; i++) {
        const betType = getBetType(userBets[i].betSpot);
        if (betType === BetTypes.NUMBER &&
            winningNumber.toString() === userBets[i].betSpot) {
            win += userBets[i].betAmount * 36;
        }
        else if (betType === BetTypes.NUMBERS_1_12 &&
            winningNumber > 0 &&
            winningNumber < 13) {
            win += userBets[i].betAmount * 3;
        }
        else if (betType === BetTypes.NUMBERS_2_12 &&
            winningNumber > 12 &&
            winningNumber < 25) {
            win += userBets[i].betAmount * 3;
        }
        else if (betType === BetTypes.NUMBERS_3_12 &&
            winningNumber > 24 &&
            winningNumber < 37) {
            win += userBets[i].betAmount * 3;
        }
        else if (betType === BetTypes.FIRST_LINE &&
            (0, exports.calculateLineNumbers)(BetTypes.FIRST_LINE).includes(winningNumber)) {
            win += userBets[i].betAmount * 3;
        }
        else if (betType === BetTypes.SECOND_LINE &&
            (0, exports.calculateLineNumbers)(BetTypes.SECOND_LINE).includes(winningNumber)) {
            win += userBets[i].betAmount * 3;
        }
        else if (betType === BetTypes.THIRD_LINE &&
            (0, exports.calculateLineNumbers)(BetTypes.THIRD_LINE).includes(winningNumber)) {
            win += userBets[i].betAmount * 3;
        }
        else if (betType === BetTypes.ODD && winningNumber % 2 !== 0) {
            win += userBets[i].betAmount * 2;
        }
        else if (betType === BetTypes.EVEN && winningNumber % 2 === 0) {
            win += userBets[i].betAmount * 2;
        }
        else if (betType === BetTypes.RED && utils_1.REDS.includes(winningNumber)) {
            win += userBets[i].betAmount * 2;
        }
        else if (betType === BetTypes.BLACK &&
            utils_1.BLACKS.includes(winningNumber)) {
            win += userBets[i].betAmount * 2;
        }
        else if (betType === BetTypes.NUMBERS_1_18 &&
            winningNumber > 0 &&
            winningNumber < 19) {
            win += userBets[i].betAmount * 2;
        }
        else if (betType === BetTypes.NUMBERS_19_36 &&
            winningNumber > 18 &&
            winningNumber < 37) {
            win += userBets[i].betAmount * 2;
        }
        else if (betType === BetTypes.ZERO && winningNumber === 0) {
            win += userBets[i].betAmount * 0.5;
        }
    }
    return win;
};
exports.calculateWin = calculateWin;
exports.EVENTS = {
    CONNECTION: 'connection',
    CLIENT: {
        JOIN_GAME: 'join_game',
        CLIENT_DATA: 'client_data',
        CLOSE: 'disconnect'
    },
    SERVER: {
        JOINED_GAME: 'joined_game',
        STAGE_CHANGE: 'stage_change'
    },
};
