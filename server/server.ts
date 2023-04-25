import { WebSocketServer } from "ws";
import { Timer } from "easytimer.js";
import { GameLoop, GameData, Winner, ClientData } from "../common/types";
import {
    isIdUnique,
    isUserDataUnique,
    getRandomNumber,
    resetBoard,
    calculateWinners,
} from "./utils";

//initialising websocket server
const PORT = 8888;
const wss = new WebSocketServer({
    port: PORT,
});

//initialising timer
const timer = new Timer();

let gameStage: GameLoop = GameLoop.PLACE_BET;
let winningNumber: number;
const winners: Winner[] = [];
let win = 0;
let clientData: ClientData = { playerId: "", bets: [] };
const usersData: ClientData[] = [];
const uniqueData: ClientData[] = [];

const sendGameData = (gameData: GameData) => {
    wss.clients.forEach((client) => {
        client.send(JSON.stringify(gameData));
    });
};

timer.addEventListener("secondsUpdated", function () {
    const currentTime = timer.getTimeValues().seconds;
    const gameData: GameData = {
        gameStage: gameStage,
        gameTimer: currentTime,
        winningNumber: winningNumber,
        winners: winners,
    };
    sendGameData(gameData);
    switch (currentTime) {
        case 1:
            gameStage = GameLoop.PLACE_BET;
            break;
        case 25:
            gameStage = GameLoop.NO_MORE_BETS;
            break;
        case 28:
            winningNumber = getRandomNumber(0, 36);
            isUserDataUnique(uniqueData, usersData);
            gameStage = GameLoop.SPIN_WHEEL;
            break;
        case 40:
            calculateWinners(winners, uniqueData, winningNumber);
            gameStage = GameLoop.WINNER;
            break;
        case 50:
            resetBoard(winners, uniqueData);
            gameStage = GameLoop.EMPTY_BOARD;
    }
    return;
});

wss.on("connection", (socket: any) => {
    socket.on("message", (data: string) => {
        clientData = JSON.parse(data);
        socket.id = clientData.playerId;
        usersData.push(clientData);
        if (
            winners.length === 0 ||
            !isIdUnique(winners, clientData.playerId).includes(false)
        ) {
            winners.push({ playerId: clientData.playerId, win: win });
        }
    });
    socket.on("close", () => {
        console.log("closing " + socket.id);
        const indexToRemove = winners.findIndex(
            (data) => data.playerId === socket.id,
        );
        winners.splice(indexToRemove, 1);
    });
    timer.start();
});

console.log(`${new Date()}: server is listening on port  ${PORT}`);
