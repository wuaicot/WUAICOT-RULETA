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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const client_1 = require("../../generated/client");
const WalletService_1 = require("../services/WalletService");
const WithdrawalService_1 = require("../services/WithdrawalService");
const prisma = new client_1.PrismaClient();
const walletService = new WalletService_1.WalletService();
const withdrawalService = new WithdrawalService_1.WithdrawalService();
class WalletController {
    requestDeposit(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Deposit request received");
            try {
                console.log("Request body:", req.body);
                console.log("Request file:", req.file);
                const { amount } = req.body;
                const user = req.user;
                if (!user) {
                    console.error("User not authenticated in request");
                    return res.status(401).json({ error: 'User not authenticated' });
                }
                const userId = user.userId;
                const file = req.file;
                console.log("File object received:", JSON.stringify(file));
                if (!file) {
                    console.error("Missing file in deposit request");
                    return res.status(400).json({ error: 'Proof of payment is required' });
                }
                // Handle potential variations in file object properties based on storage
                const fileUrl = file.path || file.url || (file.filename ? `uploads/receipts/${file.filename}` : undefined);
                console.log("Extracted fileUrl:", fileUrl);
                if (!fileUrl) {
                    console.error("File found but path/url missing. File object:", JSON.stringify(file));
                    return res.status(500).json({ error: 'Error processing uploaded file: file path/url missing' });
                }
                const amountNumber = Number(amount);
                if (isNaN(amountNumber) || amountNumber <= 0) {
                    console.error("Invalid amount in deposit request:", amount);
                    return res.status(400).json({ error: 'Invalid deposit amount' });
                }
                const deposit = yield walletService.createDepositRequest(userId, amountNumber, fileUrl);
                res.status(201).json(deposit);
            }
            catch (error) {
                console.error("FULL Deposit error:", error);
                res.status(500).json({ error: 'Error processing deposit request', details: error.message });
            }
        });
    }
    getDepositHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.userId; // Extraer desde JWT
                const history = yield prisma.depositRequest.findMany({
                    where: { userId },
                    orderBy: { createdAt: 'desc' }
                });
                res.status(200).json(history);
            }
            catch (error) {
                res.status(500).json({ error: 'Error fetching history' });
            }
        });
    }
    updateBalance(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.userId;
                const { delta } = req.body;
                // Incrementamos (o decrementamos) el saldo usando la diferencia (delta) de la jugada
                // Esto evita sobreescribir los depósitos aprobados por el administrador
                const wallet = yield prisma.wallet.update({
                    where: { userId },
                    data: { balancePlayable: { increment: delta } }
                });
                res.status(200).json({ balance: wallet.balancePlayable });
            }
            catch (error) {
                res.status(500).json({ error: 'Error updating balance' });
            }
        });
    }
    getBalance(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.userId;
                const wallet = yield prisma.wallet.findUnique({ where: { userId } });
                res.status(200).json({ balance: (wallet === null || wallet === void 0 ? void 0 : wallet.balancePlayable) || 0 });
            }
            catch (error) {
                res.status(500).json({ error: 'Error fetching balance' });
            }
        });
    }
    requestWithdrawal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { amount, bankDetails } = req.body;
                const userId = req.user.userId;
                if (!amount || Number(amount) <= 0) {
                    return res.status(400).json({ error: 'Monto de retiro inválido' });
                }
                if (!bankDetails) {
                    return res.status(400).json({ error: 'Detalles bancarios son obligatorios' });
                }
                const withdrawal = yield withdrawalService.requestWithdrawal(userId, Number(amount), bankDetails);
                if (WalletService_1.ioInstance) {
                    WalletService_1.ioInstance.emit('NEW_WITHDRAWAL_REQUEST', withdrawal);
                }
                res.status(201).json(withdrawal);
            }
            catch (error) {
                console.error("Withdrawal error:", error);
                res.status(500).json({ error: error.message });
            }
        });
    }
    getWithdrawalHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.userId;
                const history = yield prisma.withdrawalRequest.findMany({
                    where: { userId },
                    orderBy: { createdAt: 'desc' }
                });
                res.status(200).json(history);
            }
            catch (error) {
                res.status(500).json({ error: 'Error fetching withdrawal history' });
            }
        });
    }
}
exports.WalletController = WalletController;
