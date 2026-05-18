import { PrismaClient } from '../../generated/client';
import { WalletService } from './WalletService';

const prisma = new PrismaClient();
const walletService = new WalletService();

export class AdminService {
  async approveDeposit(depositId: string) {
    return await prisma.$transaction(async (tx) => {
      const deposit = await tx.depositRequest.findUnique({ where: { id: depositId } });
      if (!deposit || deposit.status !== 'PENDING') throw new Error('Invalid deposit request');

      await tx.depositRequest.update({
        where: { id: depositId },
        data: { status: 'APPROVED' },
      });

      await walletService.addBalance(deposit.userId, Number(deposit.amount), 'DEPOSIT', deposit.id);
      
      return { success: true };
    });
  }

  async rejectDeposit(depositId: string, reason: string) {
    return await prisma.depositRequest.update({
      where: { id: depositId },
      data: { status: 'REJECTED', rejectionReason: reason },
    });
  }
}
