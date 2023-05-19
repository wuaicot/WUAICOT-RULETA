import express from 'express';
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import config from 'config';
import { Timer } from 'easytimer.js';
import { GameLoop, GameData, Winner, ClientData } from '../common/types';
import {
	isIdUnique,
	isUserDataUnique,
	getRandomNumber,
	resetBoard,
	calculateWinners,
	EVENTS,
} from './utils';

const port = config.get<string>('port');
const host = config.get<number>('host');
const corsOrigin = config.get<string>('corsOrigin');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: corsOrigin,
		credentials: true,
	},
});

app.get('/', (_, res) => {
	res.send('server is running on port 8888');
});

const timer = new Timer();

let gameStage: GameLoop = GameLoop.PLACE_BET;
let winningNumber: number;
const winners: Winner[] = [];
let win = 0;
let clientData: ClientData = { playerId: '', bets: [] };
const usersData: ClientData[] = [];
const uniqueData: ClientData[] = [];

const sendGameData = (gameData: GameData) => {
	io.emit(EVENTS.SERVER.STAGE_CHANGE, JSON.stringify(gameData));
};

const saveClientsData = (data: string) => {
	clientData = JSON.parse(data);
	usersData.push(clientData);
};

timer.addEventListener('secondsUpdated', function () {
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

io.on(EVENTS.CONNECTION, (socket: Socket) => {
	socket.on(EVENTS.CLIENT.JOIN_GAME, (data: string) => {
		timer.start();
		saveClientsData(data);
	});
	socket.on(EVENTS.CLIENT.CLIENT_DATA, (data: string) => {
		saveClientsData(data);
		if (
			winners.length === 0 ||
			!isIdUnique(winners, clientData.playerId).includes(false)
		) {
			winners.push({ playerId: clientData.playerId, win: win });
		}
	});
});

io.on(EVENTS.CLIENT.CLOSE, (socket: Socket) => {
	const indexToRemove = winners.findIndex(
		(data) => data.playerId === socket.id,
	);
	winners.splice(indexToRemove, 1);
});

httpServer.listen(port, host, () => {
	console.log('server is running on port 8888');
});
