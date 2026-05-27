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
exports.AdminService = void 0;
const client_1 = require("../../generated/client");
const WalletService_1 = require("./WalletService");
// Importamos el servidor global desde server.ts
const server_1 = require("../../server");
const prisma = new client_1.PrismaClient();
const walletService = new WalletService_1.WalletService();
class AdminService {
    approveDeposit(depositId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const deposit = yield tx.depositRequest.findUnique({ where: { id: depositId } });
                if (!deposit)
                    throw new Error('Depósito no encontrado');
                if (deposit.status !== 'PENDING')
                    throw new Error(`El estado del depósito es ${deposit.status}, no PENDING`);
                yield tx.depositRequest.update({
                    where: { id: depositId },
                    data: { status: 'APPROVED' },
                });
                const wallet = yield walletService.addBalance(deposit.userId, Number(deposit.amount), 'DEPOSIT', deposit.id);
                // Notificar al usuario que su depósito fue aprobado
                server_1.io.emit('DEPOSIT_STATUS_CHANGED', { userId: deposit.userId });
                server_1.io.emit('BALANCE_UPDATED', { userId: deposit.userId, balance: wallet.balancePlayable });
                return { success: true };
            }));
        });
    }
    rejectDeposit(depositId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const deposit = yield prisma.depositRequest.update({
                where: { id: depositId },
                data: { status: 'REJECTED', rejectionReason: reason },
            });
            // Notificar al usuario que su depósito fue rechazado
            server_1.io.emit('DEPOSIT_STATUS_CHANGED', { userId: deposit.userId });
            return deposit;
        });
    }
}
exports.AdminService = AdminService;
