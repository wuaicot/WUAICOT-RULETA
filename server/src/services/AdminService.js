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
const LedgerService_1 = require("./LedgerService");
const prisma = new client_1.PrismaClient();
const walletService = new WalletService_1.WalletService();
const ledgerService = new LedgerService_1.LedgerService();
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
                // Notificar al usuario que su depósito fue aprobado usando la instancia global
                if (WalletService_1.ioInstance) {
                    WalletService_1.ioInstance.emit('DEPOSIT_STATUS_CHANGED', { userId: deposit.userId });
                    WalletService_1.ioInstance.emit('BALANCE_UPDATED', { userId: deposit.userId, balance: wallet.balancePlayable });
                }
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
            if (WalletService_1.ioInstance) {
                WalletService_1.ioInstance.emit('DEPOSIT_STATUS_CHANGED', { userId: deposit.userId });
            }
            return deposit;
        });
    }
    approveWithdrawal(withdrawalId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const withdrawal = yield tx.withdrawalRequest.findUnique({ where: { id: withdrawalId } });
                if (!withdrawal)
                    throw new Error('Retiro no encontrado');
                if (withdrawal.status !== 'PENDING')
                    throw new Error(`El estado del retiro es ${withdrawal.status}, no PENDING`);
                yield tx.withdrawalRequest.update({
                    where: { id: withdrawalId },
                    data: { status: 'APPROVED' },
                });
                // Obtener saldo actualizado
                const wallet = yield tx.wallet.findUnique({ where: { userId: withdrawal.userId } });
                if (WalletService_1.ioInstance && wallet) {
                    WalletService_1.ioInstance.emit('WITHDRAWAL_STATUS_CHANGED', { userId: withdrawal.userId });
                    WalletService_1.ioInstance.emit('BALANCE_UPDATED', { userId: withdrawal.userId, balance: wallet.balancePlayable });
                }
                return { success: true };
            }));
        });
    }
    rejectWithdrawal(withdrawalId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const withdrawal = yield tx.withdrawalRequest.findUnique({ where: { id: withdrawalId } });
                if (!withdrawal)
                    throw new Error('Retiro no encontrado');
                if (withdrawal.status !== 'PENDING')
                    throw new Error(`El estado del retiro es ${withdrawal.status}, no PENDING`);
                // 1. Cambiar estado a REJECTED
                yield tx.withdrawalRequest.update({
                    where: { id: withdrawalId },
                    data: { status: 'REJECTED' },
                });
                // 2. Reembolsar saldo
                const wallet = yield tx.wallet.update({
                    where: { userId: withdrawal.userId },
                    data: {
                        balanceTotal: { increment: withdrawal.amount },
                        balancePlayable: { increment: withdrawal.amount },
                    },
                });
                // 3. Registrar en Ledger
                yield ledgerService.recordEntry(withdrawal.userId, 'ADJUSTMENT', Number(withdrawal.amount), withdrawal.id, { type: 'WITHDRAWAL_REJECT_REFUND' });
                // 4. Notificar cambios de saldo y estado
                if (WalletService_1.ioInstance) {
                    WalletService_1.ioInstance.emit('WITHDRAWAL_STATUS_CHANGED', { userId: withdrawal.userId });
                    WalletService_1.ioInstance.emit('BALANCE_UPDATED', { userId: withdrawal.userId, balance: wallet.balancePlayable });
                }
                return { success: true };
            }));
        });
    }
}
exports.AdminService = AdminService;
