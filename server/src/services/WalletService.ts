import { PrismaClient, Prisma } from '../../generated/client';
import { LedgerService } from './LedgerService';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const ledgerService = new LedgerService();

export class WalletService {
  async addBalance(userId: string, amount: number, type: 'DEPOSIT' | 'WIN' | 'ADJUSTMENT', referenceId?: string) {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const wallet = await tx.wallet.update({
        where: { userId },
        data: {
          balanceTotal: { increment: new Prisma.Decimal(amount) },
          balancePlayable: { increment: new Prisma.Decimal(amount) },
        },
      });

      await ledgerService.recordEntry(userId, type, amount, referenceId);

      return wallet;
    });
  }

  async createDepositRequest(userId: string, amount: number, proofUrl: string) {
    return await prisma.depositRequest.create({
      data: {
        userId,
        amount,
        status: 'PENDING',
        proofUrl,
      },
    });
  }
}
