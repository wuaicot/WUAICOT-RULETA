import { PrismaClient, Prisma } from '../../generated/client';
import { LedgerService } from './LedgerService';
import dotenv from 'dotenv';
import { Server } from 'socket.io';

dotenv.config();

const prisma = new PrismaClient();
const ledgerService = new LedgerService();

let ioInstance: Server | null = null;

export { ioInstance };

export const setIoInstance = (io: Server) => {
  ioInstance = io;
};

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
    const deposit = await prisma.depositRequest.create({
      data: {
        userId,
        amount: new Prisma.Decimal(amount),
        status: 'PENDING',
        proofUrl,
      },
    });

    // Emitir evento a los administradores
    if (ioInstance) {
      ioInstance.emit('NEW_DEPOSIT_REQUEST', deposit);
    }
    
    return deposit;
  }
}
