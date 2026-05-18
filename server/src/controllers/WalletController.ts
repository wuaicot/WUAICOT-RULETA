import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/client';
import { WalletService } from '../services/WalletService';

const prisma = new PrismaClient();
const walletService = new WalletService();

export class WalletController {
  async requestDeposit(req: Request, res: Response) {
    try {
      const { amount, userId } = req.body;
      const file = req.file;
      
      if (!file) return res.status(400).json({ error: 'Proof of payment is required' });

      const deposit = await walletService.createDepositRequest(userId || 'temp-user-id', Number(amount), file.path);
      res.status(201).json(deposit);
    } catch (error) {
      console.error("Deposit error:", error);
      res.status(500).json({ error: 'Error processing deposit request', details: (error as Error).message });
    }
  }

  async getDepositHistory(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      const history = await prisma.depositRequest.findMany({
        where: { userId: userId as string },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json(history);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching history' });
    }
  }
}
