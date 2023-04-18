import { WebSocketServer } from "ws";
import { Timer } from "easytimer.js";
import { BLACKS, REDS } from "../src/utils/utils";

//initialising websocket server
const PORT = 8888;
const wss = new WebSocketServer({
    port: PORT,
});

//initialising timer
const timer = new Timer();

//types
interface Winner {
    id: string;
    win: number;
}

interface GameData {
    gameStage: GameLoop | undefined;
    winningNumber: number | undefined;
    winners: Winner[];
}

interface ClientData {
    playerId: string;
    bets: any[];
}

enum GameLoop {
    PLACE_BET = "PLACE BETS",
    NO_MORE_BETS = "NO MORE BETS",
    SPIN_WHEEL = "SPIN WHEEL",
    WINNER = "WINNER",
    EMPTY_BOARD = "EMPTY BOARD",
}
let gameStage: GameLoop = GameLoop.PLACE_BET;
let winningNumber: number;
const winners: Winner[] = [];
let win = 0;
let clientData: ClientData = { playerId: "", bets: [] };
const usersData: ClientData[] = [];

const sendGameData = (gameData: GameData) => {
    wss.clients.forEach((client) => {
        client.send(JSON.stringify(gameData));
    });
};

timer.addEventListener("secondsUpdated", function (e: any) {
    const currentTime = timer.getTimeValues().seconds;
    const gameData: GameData = {
        gameStage: gameStage,
        winningNumber: winningNumber,
        winners: winners,
    };
    if (currentTime === 1) {
        gameStage = GameLoop.PLACE_BET;
        sendGameData(gameData);
    } else if (currentTime === 25) {
        gameStage = GameLoop.NO_MORE_BETS;
        sendGameData(gameData);
    } else if (currentTime === 28) {
        winningNumber = getRandomNumber(0, 36);
        isUserDataUnique();
        console.log(uniqueData);
        gameStage = GameLoop.SPIN_WHEEL;
        sendGameData(gameData);
    } else if (currentTime === 30) {
        for (let i = 0; i < uniqueData.length; i++) {
            for (let j = 0; j < winners.length; j++) {
                if (uniqueData[i].playerId === winners[j].id) {
                    winners[j].win = calculateWin(
                        winningNumber,
                        uniqueData[i].bets,
                    );
                }
            }
        }
        gameStage = GameLoop.WINNER;
        sendGameData(gameData);
    } else if (currentTime === 35) {
        gameStage = GameLoop.EMPTY_BOARD;
        sendGameData(gameData);
    }
    return;
});

const isIdUnique = (winners: Winner[], id: string) => {
    return winners.map(
        (winner) => JSON.stringify(winner.id) !== JSON.stringify(id),
    );
};
const uniqueData: any[] = [];
const isUserDataUnique = () => {
    const reverse = usersData.reverse();
    for (let i = 0; i < reverse.length; i++) {
        if (
            uniqueData.length === 0 ||
            !uniqueData
                .map(
                    (data) =>
                        JSON.stringify(data.playerId) !==
                        JSON.stringify(reverse[i].playerId),
                )
                .includes(false)
        ) {
            uniqueData.push(reverse[i]);
        }
    }
};

wss.on("connection", (socket: any) => {
    socket.on("message", (data: any) => {
        clientData = JSON.parse(data);
        usersData.push(clientData);
        if (
            winners.length === 0 ||
            !isIdUnique(winners, clientData.playerId).includes(false)
        ) {
            winners.push({ id: clientData.playerId, win: win });
        }
    });
    timer.start();
});

console.log(`${new Date()}: server is listening on port  ${PORT}`);

const getRandomNumber = (min: number, max: number) => {
    const minValue = Math.ceil(min);
    const maxValue = Math.floor(max);
    return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
};

enum BetTypes {
    NUMBER = "number",
    ZERO = "zero",
    BLACK = "black",
    RED = "red",
    EVEN = "even",
    ODD = "odd",
    FIRST_LINE = "first_line",
    SECOND_LINE = "second_line",
    THIRD_LINE = "third_line",
    NUMBERS_1_18 = "numbers_1_18",
    NUMBERS_19_36 = "numbers_19_36",
    NUMBERS_1_12 = "numbers_1_12",
    NUMBERS_2_12 = "numbers_2_12",
    NUMBERS_3_12 = "numbers_3_12",
}

const getBetType = (betSpot: number | string) => {
    switch (betSpot) {
        case "1ST12":
            return "numbers_1_12";
            break;
        case "2ND12":
            return "numbers_2_12";
            break;
        case "3RD12":
            return "numbers_3_12";
            break;
        case "1TO18":
            return "numbers_1_18";
            break;
        case "19TO36":
            return "numbers_19_36";
            break;
        case "2TO1_1":
            return "first_line";
            break;
        case "2TO1_2":
            return "second_line";
            break;
        case "2TO1_3":
            return "third_line";
            break;
        case "RED":
            return "red";
            break;
        case "BLACK":
            return "black";
            break;
        case "EVEN":
            return "even";
            break;
        case "ODD":
            return "odd";
            break;
        case "0":
            return "zero";
            break;
        default:
            return "number";
    }
};

const calculateLineNumbers = (line: string) => {
    const lineNumbersArray = [];
    let currentNumber = line.includes("first")
        ? 1
        : line.includes("second")
        ? 2
        : 3;
    for (let i = currentNumber; i <= 36; i += 3) {
        lineNumbersArray.push(i);
    }
    return lineNumbersArray;
};

const calculateWin = (winningNumber: number, bets: any) => {
    const userBets = bets;
    for (let i = 0; i < userBets.length; i++) {
        const betType = getBetType(userBets[i].betSpot);
        if (
            betType === BetTypes.NUMBER &&
            winningNumber.toString() === userBets[i].betSpot
        ) {
            win += userBets[i].betAmount * 36;
        } else if (
            betType === BetTypes.NUMBERS_1_12 &&
            winningNumber > 0 &&
            winningNumber < 13
        ) {
            win += userBets[i].betAmount * 3;
        } else if (
            betType === BetTypes.NUMBERS_2_12 &&
            winningNumber > 12 &&
            winningNumber < 25
        ) {
            win += userBets[i].betAmount * 3;
        } else if (
            betType === BetTypes.NUMBERS_3_12 &&
            winningNumber > 24 &&
            winningNumber < 37
        ) {
            win += userBets[i].betAmount * 3;
        } else if (
            betType === BetTypes.FIRST_LINE &&
            calculateLineNumbers(BetTypes.FIRST_LINE).includes(winningNumber)
        ) {
            win += userBets[i].betAmount * 2;
        } else if (
            betType === BetTypes.SECOND_LINE &&
            calculateLineNumbers(BetTypes.SECOND_LINE).includes(winningNumber)
        ) {
            win += userBets[i].betAmount * 2;
        } else if (
            betType === BetTypes.THIRD_LINE &&
            calculateLineNumbers(BetTypes.THIRD_LINE).includes(winningNumber)
        ) {
            win += userBets[i].betAmount * 2;
        } else if (betType === BetTypes.ODD && winningNumber % 2 !== 0) {
            win += userBets[i].betAmount * 2;
        } else if (betType === BetTypes.EVEN && winningNumber % 2 === 0) {
            win += userBets[i].betAmount * 2;
        } else if (betType === BetTypes.RED && REDS.includes(winningNumber)) {
            win += userBets[i].betAmount * 2;
        } else if (
            betType === BetTypes.BLACK &&
            BLACKS.includes(winningNumber)
        ) {
            win += userBets[i].betAmount * 2;
        } else if (
            betType === BetTypes.NUMBERS_1_18 &&
            winningNumber > 0 &&
            winningNumber < 19
        ) {
            win += userBets[i].betAmount * 2;
        } else if (
            betType === BetTypes.NUMBERS_19_36 &&
            winningNumber > 18 &&
            winningNumber < 37
        ) {
            win += userBets[i].betAmount * 2;
        } else if (betType === BetTypes.ZERO && winningNumber === 0) {
            win += userBets[i].betAmount * 0.5;
        }
    }
    return win;
};
