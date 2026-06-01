"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
require("dotenv/config"); // Asegura que las variables estén cargadas antes de nada
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const easytimer_js_1 = require("easytimer.js");
const path_1 = __importDefault(require("path"));
const client_1 = require("./generated/client");
const types_1 = require("./src/shared/types");
const utils_1 = require("./utils");
const AuthController_1 = require("./src/controllers/AuthController");
const WalletController_1 = require("./src/controllers/WalletController");
const AdminController_1 = require("./src/controllers/AdminController");
const auth_1 = require("./src/middleware/auth");
const upload_1 = require("./src/middleware/upload");
const WalletService_1 = require("./src/services/WalletService");
//initialising http server and socket.io
const PORT = process.env.PORT || 8888;
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "https://wuaicot-ruleta-n2qj-theta.vercel.app"],
    credentials: true,
}));
app.use((req, res, next) => {
    console.log(`[GLOBAL] Received ${req.method} ${req.url}`);
    next();
});
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
const authController = new AuthController_1.AuthController();
const walletController = new WalletController_1.WalletController();
const adminController = new AdminController_1.AdminController();
const prisma = new client_1.PrismaClient();
// Routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/me', auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const user = yield prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    res.json({ user: { id: user.id, nickname: user.nickname } });
}));
app.post('/api/wallet/deposit', auth_1.authMiddleware, upload_1.upload.single('proof'), walletController.requestDeposit);
app.get('/api/wallet/history', auth_1.authMiddleware, walletController.getDepositHistory);
app.get('/api/wallet/balance', auth_1.authMiddleware, walletController.getBalance);
app.post('/api/wallet/update-balance', auth_1.authMiddleware, walletController.updateBalance);
app.post('/api/wallet/withdraw', auth_1.authMiddleware, walletController.requestWithdrawal);
app.get('/api/wallet/withdrawal-history', auth_1.authMiddleware, walletController.getWithdrawalHistory);
app.post('/api/admin/approve-deposit', adminController.approveDeposit);
app.post('/api/admin/reject-deposit', adminController.rejectDeposit);
app.get('/api/admin/pending-deposits', adminController.getPendingDeposits);
app.post('/api/admin/approve-withdrawal', adminController.approveWithdrawal);
app.post('/api/admin/reject-withdrawal', adminController.rejectWithdrawal);
app.get('/api/admin/pending-withdrawals', adminController.getPendingWithdrawals);
const httpServer = (0, http_1.createServer)(app);
exports.io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
    },
});
(0, WalletService_1.setIoInstance)(exports.io);
//initialising timer
const timer = new easytimer_js_1.Timer();
let gameStage = types_1.GameLoop.PLACE_BET;
let winningNumber;
const winners = [];
let win = 0;
const usersData = [];
const uniqueData = [];
const sendGameData = (gameData) => {
    exports.io.emit("stage_change", JSON.stringify(gameData));
};
timer.addEventListener("secondsUpdated", function () {
    const currentTime = timer.getTimeValues().seconds;
    const gameData = {
        gameStage: gameStage,
        gameTimer: currentTime,
        winningNumber: winningNumber,
        winners: winners,
    };
    sendGameData(gameData);
    switch (currentTime) {
        case 1:
            gameStage = types_1.GameLoop.PLACE_BET;
            break;
        case 25:
            gameStage = types_1.GameLoop.NO_MORE_BETS;
            break;
        case 28:
            winningNumber = (0, utils_1.getRandomNumber)(0, 36);
            (0, utils_1.isUserDataUnique)(uniqueData, usersData);
            gameStage = types_1.GameLoop.SPIN_WHEEL;
            break;
        case 40:
            (0, utils_1.calculateWinners)(winners, uniqueData, winningNumber);
            gameStage = types_1.GameLoop.WINNER;
            break;
        case 50:
            (0, utils_1.resetBoard)(winners, uniqueData, usersData);
            gameStage = types_1.GameLoop.EMPTY_BOARD;
    }
    return;
});
let timerStarted = false;
exports.io.on("connection", (socket) => {
    console.log("Client connected: " + socket.id);
    const handleClientData = (data) => {
        try {
            const clientData = JSON.parse(data);
            // console.log("Client data received:", clientData); // <--- Debug
            // Store the player ID on the socket for easy access on disconnect
            socket.playerId = clientData.playerId;
            usersData.push(clientData);
            if (winners.length === 0 ||
                (0, utils_1.isIdUnique)(winners, clientData.playerId)) {
                winners.push({ playerId: clientData.playerId, win: win });
            }
        }
        catch (e) {
            console.error("Error parsing client data:", e);
        }
    };
    socket.on("join_game", handleClientData);
    socket.on("client_data", handleClientData);
    socket.on("disconnect", () => {
        const playerId = socket.playerId;
        console.log("closing " + (playerId || socket.id));
        if (playerId) {
            const indexToRemove = winners.findIndex((data) => data.playerId === playerId);
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
