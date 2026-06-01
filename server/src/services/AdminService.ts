import { PrismaClient, Prisma } from '../../generated/client';
import { WalletService, ioInstance } from './WalletService';
import { LedgerService } from './LedgerService';

const prisma = new PrismaClient();
const walletService = new WalletService();
const ledgerService = new LedgerService();

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

  async approveWithdrawal(withdrawalId: string) {
    return await prisma.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawalRequest.findUnique({ where: { id: withdrawalId } });
      
      if (!withdrawal) throw new Error('Retiro no encontrado');
      if (withdrawal.status !== 'PENDING') throw new Error(`El estado del retiro es ${withdrawal.status}, no PENDING`);

      await tx.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: { status: 'APPROVED' },
      });

      // Obtener saldo actualizado
      const wallet = await tx.wallet.findUnique({ where: { userId: withdrawal.userId } });

      if (ioInstance && wallet) {
        ioInstance.emit('WITHDRAWAL_STATUS_CHANGED', { userId: withdrawal.userId });
        ioInstance.emit('BALANCE_UPDATED', { userId: withdrawal.userId, balance: wallet.balancePlayable });
      }

      return { success: true };
    });
  }

  async rejectWithdrawal(withdrawalId: string) {
    return await prisma.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawalRequest.findUnique({ where: { id: withdrawalId } });
      
      if (!withdrawal) throw new Error('Retiro no encontrado');
      if (withdrawal.status !== 'PENDING') throw new Error(`El estado del retiro es ${withdrawal.status}, no PENDING`);

      // 1. Cambiar estado a REJECTED
      await tx.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: { status: 'REJECTED' },
      });

      // 2. Reembolsar saldo
      const wallet = await tx.wallet.update({
        where: { userId: withdrawal.userId },
        data: {
          balanceTotal: { increment: withdrawal.amount },
          balancePlayable: { increment: withdrawal.amount },
        },
      });

      // 3. Registrar en Ledger
      await ledgerService.recordEntry(
        withdrawal.userId,
        'ADJUSTMENT',
        Number(withdrawal.amount),
        withdrawal.id,
        { type: 'WITHDRAWAL_REJECT_REFUND' }
      );

      // 4. Notificar cambios de saldo y estado
      if (ioInstance) {
        ioInstance.emit('WITHDRAWAL_STATUS_CHANGED', { userId: withdrawal.userId });
        ioInstance.emit('BALANCE_UPDATED', { userId: withdrawal.userId, balance: wallet.balancePlayable });
      }

      return { success: true };
    });
  }
}

