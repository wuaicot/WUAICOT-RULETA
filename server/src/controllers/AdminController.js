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
exports.AdminController = void 0;
const client_1 = require("../../generated/client");
const prisma = new client_1.PrismaClient();
class AdminController {
    approveDeposit(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { depositId } = req.body;
                const adminService = new (require('../services/AdminService')).AdminService();
                yield adminService.approveDeposit(depositId);
                res.status(200).json({ message: 'Deposit approved successfully' });
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }
    rejectDeposit(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { depositId, reason } = req.body;
                const adminService = new (require('../services/AdminService')).AdminService();
                yield adminService.rejectDeposit(depositId, reason);
                res.status(200).json({ message: 'Deposit rejected successfully' });
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }
    getPendingDeposits(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const deposits = yield prisma.depositRequest.findMany({
                    where: { status: 'PENDING' },
                    include: { user: true }
                });
                res.status(200).json(deposits);
            }
            catch (error) {
                res.status(500).json({ error: 'Error fetching deposits' });
            }
        });
    }
    approveWithdrawal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { withdrawalId } = req.body;
                const adminService = new (require('../services/AdminService')).AdminService();
                yield adminService.approveWithdrawal(withdrawalId);
                res.status(200).json({ message: 'Withdrawal approved successfully' });
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }
    rejectWithdrawal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { withdrawalId } = req.body;
                const adminService = new (require('../services/AdminService')).AdminService();
                yield adminService.rejectWithdrawal(withdrawalId);
                res.status(200).json({ message: 'Withdrawal rejected successfully' });
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }
    getPendingWithdrawals(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const withdrawals = yield prisma.withdrawalRequest.findMany({
                    where: { status: 'PENDING' },
                    include: { user: true }
                });
                res.status(200).json(withdrawals);
            }
            catch (error) {
                res.status(500).json({ error: 'Error fetching withdrawals' });
            }
        });
    }
}
exports.AdminController = AdminController;
