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
exports.WithdrawalService = void 0;
const client_1 = require("../../generated/client");
const LedgerService_1 = require("./LedgerService");
const prisma = new client_1.PrismaClient();
const ledgerService = new LedgerService_1.LedgerService();
class WithdrawalService {
    /**
     * Solicita un retiro:
     * 1. Verifica fondos suficientes.
     * 2. Descuenta el saldo (Total y Jugable).
     * 3. Crea la solicitud PENDIENTE.
     * 4. Registra en Ledger.
     */
    requestWithdrawal(userId, amount, bankDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // 1. Obtener y verificar wallet
                const wallet = yield tx.wallet.findUnique({
                    where: { userId },
                });
                // Usamos balancePlayable para validar fondos
                if (!wallet || wallet.balancePlayable.toNumber() < amount) {
                    throw new Error('Saldo insuficiente para realizar el retiro');
                }
                // 2. Descontar saldo inmediatamente para evitar doble gasto
                yield tx.wallet.update({
                    where: { userId },
                    data: {
                        balanceTotal: { decrement: new client_1.Prisma.Decimal(amount) },
                        balancePlayable: { decrement: new client_1.Prisma.Decimal(amount) },
                    },
                });
                // 3. Crear solicitud con estado PENDING
                const withdrawal = yield tx.withdrawalRequest.create({
                    data: {
                        userId,
                        amount: new client_1.Prisma.Decimal(amount),
                        bankDetails: bankDetails,
                        status: 'PENDING',
                    },
                });
                // 4. Registrar en ledger
                yield ledgerService.recordEntry(userId, 'WITHDRAWAL', amount, withdrawal.id, { type: 'REQUEST', bankDetails });
                return withdrawal;
            }));
        });
    }
}
exports.WithdrawalService = WithdrawalService;
