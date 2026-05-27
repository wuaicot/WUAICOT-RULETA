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
const prisma = new client_1.PrismaClient();
const walletService = new WalletService_1.WalletService();
class WalletController {
    requestDeposit(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { amount } = req.body;
                const userId = req.user.userId; // Extraer desde JWT
                const file = req.file;
                if (!file)
                    return res.status(400).json({ error: 'Proof of payment is required' });
                const deposit = yield walletService.createDepositRequest(userId, Number(amount), file.path);
                res.status(201).json(deposit);
            }
            catch (error) {
                console.error("Deposit error:", error);
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
}
exports.WalletController = WalletController;
