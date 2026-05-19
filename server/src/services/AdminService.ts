import { PrismaClient } from '../../generated/client';
import { WalletService } from './WalletService';

const prisma = new PrismaClient();
const walletService = new WalletService();

export class AdminService {
  async approveDeposit(depositId: string) {
    return await prisma.$transaction(async (tx) => {
      const deposit = await tx.depositRequest.findUnique({ where: { id: depositId } });
      
      console.log('Depósito encontrado:', deposit);
      if (!deposit) throw new Error('Depósito no encontrado');
      if (deposit.status !== 'PENDING') throw new Error(`El estado del depósito es ${deposit.status}, no PENDING`);

      await tx.depositRequest.update({
        where: { id: depositId },
        data: { status: 'APPROVED' },
      });

      console.log('Intentando acreditar saldo para:', deposit.userId);
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
