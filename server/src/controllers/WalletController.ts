import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/client';
import { WalletService, ioInstance } from '../services/WalletService';
import { WithdrawalService } from '../services/WithdrawalService';

const prisma = new PrismaClient();
const walletService = new WalletService();
const withdrawalService = new WithdrawalService();

export class WalletController {
  async requestDeposit(req: Request, res: Response) {
    console.log("Deposit request received");
    try {
      console.log("Request body:", req.body);
      console.log("Request file:", req.file);
      const { amount } = req.body;
      const user = (req as any).user;
      if (!user) {
        console.error("User not authenticated in request");
        return res.status(401).json({ error: 'User not authenticated' });
      }
      const userId = user.userId;
      const file = req.file as any;
      console.log("File object received:", JSON.stringify(file));
      
      if (!file) {
        console.error("Missing file in deposit request");
        return res.status(400).json({ error: 'Proof of payment is required' });
      }

      // Handle potential variations in file object properties based on storage
      const fileUrl = file.path || file.url || (file.filename ? `uploads/receipts/${file.filename}` : undefined);
      console.log("Extracted fileUrl:", fileUrl);
      
      if (!fileUrl) {
        console.error("File found but path/url missing. File object:", JSON.stringify(file));
        return res.status(500).json({ error: 'Error processing uploaded file: file path/url missing' });
      }

      const amountNumber = Number(amount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        console.error("Invalid amount in deposit request:", amount);
        return res.status(400).json({ error: 'Invalid deposit amount' });
      }

      const deposit = await walletService.createDepositRequest(userId, amountNumber, fileUrl);
      res.status(201).json(deposit);
    } catch (error) {
      console.error("FULL Deposit error:", error);
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

  async requestWithdrawal(req: Request, res: Response) {
    try {
      const { amount, bankDetails } = req.body;
      const userId = (req as any).user.userId;

      if (!amount || Number(amount) <= 0) {
        return res.status(400).json({ error: 'Monto de retiro inválido' });
      }
      if (!bankDetails) {
        return res.status(400).json({ error: 'Detalles bancarios son obligatorios' });
      }

      const withdrawal = await withdrawalService.requestWithdrawal(userId, Number(amount), bankDetails);

      if (ioInstance) {
        ioInstance.emit('NEW_WITHDRAWAL_REQUEST', withdrawal);
      }

      res.status(201).json(withdrawal);
    } catch (error) {
      console.error("Withdrawal error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getWithdrawalHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const history = await prisma.withdrawalRequest.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json(history);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching withdrawal history' });
    }
  }
}
