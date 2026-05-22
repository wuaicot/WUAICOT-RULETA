import 'dotenv/config'; // Asegura que las variables estén cargadas antes de nada
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { Timer } from "easytimer.js";
import path from "path";
import { GameLoop, GameData, Winner, ClientData } from "../client/src/common/types";
import {
    isIdUnique,
    isUserDataUnique,
    getRandomNumber,
    resetBoard,
    calculateWinners,
} from "./utils";
import { AuthController } from "./src/controllers/AuthController";
import { WalletController } from "./src/controllers/WalletController";
import { AdminController } from "./src/controllers/AdminController";
import { authMiddleware } from "./src/middleware/auth";
import { upload } from "./src/middleware/upload";

//initialising http server and socket.io
const PORT = 8888;
const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authController = new AuthController();
const walletController = new WalletController();
const adminController = new AdminController();

// Routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

app.post('/api/wallet/deposit', authMiddleware, upload.single('proof'), walletController.requestDeposit);
app.get('/api/wallet/history', authMiddleware, walletController.getDepositHistory);
app.get('/api/wallet/balance', authMiddleware, walletController.getBalance);
app.post('/api/wallet/update-balance', authMiddleware, walletController.updateBalance);
app.post('/api/admin/approve-deposit', adminController.approveDeposit);
app.post('/api/admin/reject-deposit', adminController.rejectDeposit);
app.get('/api/admin/pending-deposits', adminController.getPendingDeposits);

const httpServer = createServer(app);
export const io = new Server(httpServer, {
    cors: {
        origin: "*",
    },
});

//initialising timer
const timer = new Timer();


let gameStage: GameLoop = GameLoop.PLACE_BET;
let winningNumber: number;
const winners: Winner[] = [];
let win = 0;
const usersData: ClientData[] = [];
const uniqueData: ClientData[] = [];

const sendGameData = (gameData: GameData) => {
    io.emit("stage_change", JSON.stringify(gameData));
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
            resetBoard(winners, uniqueData, usersData);
            gameStage = GameLoop.EMPTY_BOARD;
    }
    return;
});

let timerStarted = false;

io.on("connection", (socket) => {
    console.log("Client connected: " + socket.id);

    const handleClientData = (data: string) => {
        try {
            const clientData: ClientData = JSON.parse(data);
            // Store the player ID on the socket for easy access on disconnect
            (socket as any).playerId = clientData.playerId;
            usersData.push(clientData);
            
            if (
                winners.length === 0 ||
                isIdUnique(winners, clientData.playerId)
            ) {
                winners.push({ playerId: clientData.playerId, win: win });
            }
        } catch (e) {
            console.error("Error parsing client data:", e);
        }
    };

    socket.on("join_game", handleClientData);
    socket.on("client_data", handleClientData);

    socket.on("disconnect", () => {
        const playerId = (socket as any).playerId;
        console.log("closing " + (playerId || socket.id));
        if (playerId) {
            const indexToRemove = winners.findIndex(
                (data) => data.playerId === playerId,
            );
            if (indexToRemove !== -1) {
                winners.splice(indexToRemove, 1);
            }
        }
    });

    if (!timerStarted) {
        timer.start();
        timerStarted = true;
    }
});

httpServer.listen(PORT, () => {
    console.log(`${new Date()}: server is listening on port  ${PORT}`);
});