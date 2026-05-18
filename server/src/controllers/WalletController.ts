import { Request, Response } from 'express';
import { WalletService } from '../services/WalletService';

const walletService = new WalletService();

export class WalletController {
  async requestDeposit(req: Request, res: Response) {
    try {
      const { amount } = req.body;
      const file = req.file;
      // TEMPORAL: Mock de ID de usuario hasta implementar auth completa
      const userId = (req as any).user?.id || 'temp-user-id';
      
      console.log("Deposit attempt:", { amount, userId, file });
      
      if (!file) return res.status(400).json({ error: 'Proof of payment is required' });

      const deposit = await walletService.createDepositRequest(userId, Number(amount), file.path);
      res.status(201).json(deposit);
    } catch (error) {
      console.error("Deposit error:", error);
      res.status(500).json({ error: 'Error processing deposit request', details: (error as Error).message });
    }
  }
}
