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
exports.WalletService = exports.setIoInstance = exports.ioInstance = void 0;
const client_1 = require("../../generated/client");
const LedgerService_1 = require("./LedgerService");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const ledgerService = new LedgerService_1.LedgerService();
let ioInstance = null;
exports.ioInstance = ioInstance;
const setIoInstance = (io) => {
    exports.ioInstance = ioInstance = io;
};
exports.setIoInstance = setIoInstance;
class WalletService {
    addBalance(userId, amount, type, referenceId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    console.log('Buscando wallet para usuario:', userId);
                    const wallet = yield tx.wallet.update({
                        where: { userId },
                        data: {
                            balanceTotal: { increment: new client_1.Prisma.Decimal(amount) },
                            balancePlayable: { increment: new client_1.Prisma.Decimal(amount) },
                        },
                    });
                    console.log('Wallet actualizada:', wallet);
                    yield ledgerService.recordEntry(userId, type, amount, referenceId);
                    console.log('Entrada de ledger registrada');
                    return wallet;
                }));
            }
            catch (error) {
                console.error('Error en addBalance (transacción):', error);
                throw error;
            }
        });
    }
    createDepositRequest(userId, amount, proofUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const deposit = yield prisma.depositRequest.create({
                data: {
                    userId,
                    amount: new client_1.Prisma.Decimal(amount),
                    status: 'PENDING',
                    proofUrl,
                },
            });
            // Emitir evento a los administradores
            if (ioInstance) {
                ioInstance.emit('NEW_DEPOSIT_REQUEST', deposit);
            }
            return deposit;
        });
    }
}
exports.WalletService = WalletService;
