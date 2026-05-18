import { PrismaClient } from '../../generated/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

export class LedgerService {
  async recordEntry(
    userId: string,
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'BET' | 'WIN' | 'ADJUSTMENT',
    amount: number,
    referenceId?: string,
    metadata?: any
  ) {
    return await prisma.ledgerEntry.create({
      data: {
        userId,
        type,
        amount,
        referenceId,
        metadata,
      },
    });
  }
}
