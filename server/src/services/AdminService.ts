import { PrismaClient } from '../../generated/client';
import { WalletService, ioInstance } from './WalletService';

const prisma = new PrismaClient();
const walletService = new WalletService();

export class AdminService {
  async approveDeposit(depositId: string) {
    return await prisma.$transaction(async (tx) => {
      const deposit = await tx.depositRequest.findUnique({ where: { id: depositId } });
      
      if (!deposit) throw new Error('Depósito no encontrado');
      if (deposit.status !== 'PENDING') throw new Error(`El estado del depósito es ${deposit.status}, no PENDING`);

      await tx.depositRequest.update({
        where: { id: depositId },
        data: { status: 'APPROVED' },
      });

      const wallet = await walletService.addBalance(deposit.userId, Number(deposit.amount), 'DEPOSIT', deposit.id);
      
      // Notificar al usuario que su depósito fue aprobado usando la instancia global
      if (ioInstance) {
        ioInstance.emit('DEPOSIT_STATUS_CHANGED', { userId: deposit.userId });
        ioInstance.emit('BALANCE_UPDATED', { userId: deposit.userId, balance: wallet.balancePlayable });
      }
      
      return { success: true };
    });
  }

  async rejectDeposit(depositId: string, reason: string) {
    const deposit = await prisma.depositRequest.update({
      where: { id: depositId },
      data: { status: 'REJECTED', rejectionReason: reason },
    });
    
    // Notificar al usuario que su depósito fue rechazado
    if (ioInstance) {
      ioInstance.emit('DEPOSIT_STATUS_CHANGED', { userId: deposit.userId });
    }
    
    return deposit;
  }
}
