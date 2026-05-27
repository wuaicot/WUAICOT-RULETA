import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/client';
import { WalletService } from '../services/WalletService';

const prisma = new PrismaClient();
const walletService = new WalletService();

export class WalletController {
  async requestDeposit(req: Request, res: Response) {
    try {
      const { amount } = req.body;
      const userId = (req as any).user.userId;
      const file = req.file as any;
      
      if (!file) return res.status(400).json({ error: 'Proof of payment is required' });

      // Cloudinary devuelve la URL en la propiedad 'path'
      const deposit = await walletService.createDepositRequest(userId, Number(amount), file.path);
      res.status(201).json(deposit);
    } catch (error) {
      console.error("Deposit error:", error);
      res.status(500).json({ error: 'Error processing deposit request', details: (error as Error).message });
    }
  }

  async getDepositHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId; // Extraer desde JWT
      const history = await prisma.depositRequest.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json(history);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching history' });
    }
  }

  async updateBalance(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { delta } = req.body;
      
      // Incrementamos (o decrementamos) el saldo usando la diferencia (delta) de la jugada
      // Esto evita sobreescribir los depósitos aprobados por el administrador
      const wallet = await prisma.wallet.update({
        where: { userId },
        data: { balancePlayable: { increment: delta } }
      });
      
      res.status(200).json({ balance: wallet.balancePlayable });
    } catch (error) {
      res.status(500).json({ error: 'Error updating balance' });
    }
  }

  async getBalance(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      res.status(200).json({ balance: wallet?.balancePlayable || 0 });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching balance' });
    }
  }
}
