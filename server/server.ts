import 'dotenv/config'; // Asegura que las variables estén cargadas antes de nada
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { Timer } from "easytimer.js";
import path from "path";
import { PrismaClient } from "./generated/client";
import { GameLoop, GameData, Winner, ClientData } from "./src/shared/types";
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
import { setIoInstance } from "./src/services/WalletService";

//initialising http server and socket.io
const PORT = process.env.PORT || 8888;
const app = express();
const allowedOrigins = [
    "http://localhost:3000",
    "https://wuaicot-ruleta-n2qj-theta.vercel.app"
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const isLocalIp = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}):\d+$/.test(origin);
        if (allowedOrigins.indexOf(origin) !== -1 || isLocalIp) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS: ' + origin));
        }
    },
    credentials: true,
}));
app.use((req, res, next) => {
    console.log(`[GLOBAL] Received ${req.method} ${req.url}`);
    next();
});
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authController = new AuthController();
const walletController = new WalletController();
const adminController = new AdminController();
const prisma = new PrismaClient();

// Middleware para verificar rol ADMIN
const adminMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userId = (req as any).user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Acceso restringido: se requieren permisos de administrador' });
    }
    next();
};

// Routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/me', authMiddleware, async (req, res) => {
    const userId = (req as any).user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { id: user.id, nickname: user.nickname, role: user.role } });
});

app.post('/api/wallet/deposit', authMiddleware, upload.single('proof'), walletController.requestDeposit);
app.get('/api/wallet/history', authMiddleware, walletController.getDepositHistory);
app.get('/api/wallet/balance', authMiddleware, walletController.getBalance);
app.post('/api/wallet/update-balance', authMiddleware, walletController.updateBalance);
app.post('/api/wallet/withdraw', authMiddleware, walletController.requestWithdrawal);
app.get('/api/wallet/withdrawal-history', authMiddleware, walletController.getWithdrawalHistory);

// Admin Routes (Protegidas)
app.post('/api/admin/approve-deposit', authMiddleware, adminMiddleware, adminController.approveDeposit);
app.post('/api/admin/reject-deposit', authMiddleware, adminMiddleware, adminController.rejectDeposit);
app.get('/api/admin/pending-deposits', authMiddleware, adminMiddleware, adminController.getPendingDeposits);
app.post('/api/admin/approve-withdrawal', authMiddleware, adminMiddleware, adminController.approveWithdrawal);
app.post('/api/admin/reject-withdrawal', authMiddleware, adminMiddleware, adminController.rejectWithdrawal);
app.get('/api/admin/pending-withdrawals', authMiddleware, adminMiddleware, adminController.getPendingWithdrawals);

const httpServer = createServer(app);
export const io = new Server(httpServer, {
    cors: {
        origin: "*",
    },
});

setIoInstance(io);

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
            // console.log("Client data received:", clientData); // <--- Debug
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