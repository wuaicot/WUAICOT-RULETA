import { PrismaClient, Prisma } from '../../generated/client';
import { LedgerService } from './LedgerService';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const ledgerService = new LedgerService();

export class WalletService {
  async addBalance(userId: string, amount: number, type: 'DEPOSIT' | 'WIN' | 'ADJUSTMENT', referenceId?: string) {
    try {
      return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        console.log('Buscando wallet para usuario:', userId);
        const wallet = await tx.wallet.update({
          where: { userId },
          data: {
            balanceTotal: { increment: new Prisma.Decimal(amount) },
            balancePlayable: { increment: new Prisma.Decimal(amount) },
          },
        });
        console.log('Wallet actualizada:', wallet);

        await ledgerService.recordEntry(userId, type, amount, referenceId);
        console.log('Entrada de ledger registrada');

        return wallet;
      });
    } catch (error) {
      console.error('Error en addBalance (transacción):', error);
      throw error;
    }
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
