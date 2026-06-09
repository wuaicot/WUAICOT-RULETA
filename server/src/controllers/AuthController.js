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
exports.AuthController = void 0;
const client_1 = require("../../generated/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
class AuthController {
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nickname, age, pin } = req.body;
                const pinHash = yield bcrypt_1.default.hash(pin, 10);
                const result = yield prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const user = yield tx.user.create({
                        data: { nickname, age: Number(age), pinHash }
                    });
                    
                    // Crear wallet con saldo inicial de 1000 ("Una Luka")
                    yield tx.wallet.create({
                        data: { 
                            userId: user.id,
                            balanceTotal: new client_1.Prisma.Decimal(1000),
                            balancePlayable: new client_1.Prisma.Decimal(1000)
                        }
                    });

                    // Registrar en el ledger el bono de bienvenida
                    yield tx.ledgerEntry.create({
                        data: {
                            userId: user.id,
                            type: 'ADJUSTMENT',
                            amount: new client_1.Prisma.Decimal(1000),
                            metadata: { reason: 'WELCOME_BONUS' }
                        }
                    });

                    return user;
                }));
                const token = jsonwebtoken_1.default.sign({ userId: result.id }, JWT_SECRET, { expiresIn: '24h' });
                res.status(201).json({ token, user: { id: result.id, nickname: result.nickname, role: result.role } });
            }
            catch (error) {
                res.status(400).json({ error: 'Error al registrar usuario: ' + error.message });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nickname, pin } = req.body;
                const user = yield prisma.user.findUnique({ where: { nickname } });
                if (!user || !(yield bcrypt_1.default.compare(pin, user.pinHash))) {
                    return res.status(401).json({ error: 'Nickname o PIN incorrecto' });
                }
                const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
                res.status(200).json({ token, user: { id: user.id, nickname: user.nickname, role: user.role } });
            }
            catch (error) {
                res.status(500).json({ error: 'Error al iniciar sesión' });
            }
        });
    }
}
exports.AuthController = AuthController;
