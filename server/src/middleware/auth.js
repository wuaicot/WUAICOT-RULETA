"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const authMiddleware = (req, res, next) => {
    var _a;
    console.log(`[AUTH] Request received: ${req.method} ${req.url}`);
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        console.error("[AUTH] No token provided");
        return res.status(401).json({ error: 'Acceso no autorizado' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        console.log(`[AUTH] User authenticated: ${decoded.userId}`);
        req.user = decoded;
        next();
    }
    catch (err) {
        console.error("[AUTH] Invalid token:", err);
        res.status(401).json({ error: 'Token inválido' });
    }
};
exports.authMiddleware = authMiddleware;
