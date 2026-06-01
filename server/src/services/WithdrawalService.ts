import { PrismaClient, Prisma } from '../../generated/client';
import { LedgerService } from './LedgerService';

const prisma = new PrismaClient();
const ledgerService = new LedgerService();

export class WithdrawalService {
  /**
   * Solicita un retiro: 
   * 1. Verifica fondos suficientes.
   * 2. Descuenta el saldo (Total y Jugable).
   * 3. Crea la solicitud PENDIENTE.
   * 4. Registra en Ledger.
   */
  async requestWithdrawal(userId: string, amount: number, bankDetails: any) {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Obtener y verificar wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      // Usamos balancePlayable para validar fondos
      if (!wallet || wallet.balancePlayable.toNumber() < amount) {
        throw new Error('Saldo insuficiente para realizar el retiro');
      }

      // 2. Descontar saldo inmediatamente para evitar doble gasto
      await tx.wallet.update({
        where: { userId },
        data: {
          balanceTotal: { decrement: new Prisma.Decimal(amount) },
          balancePlayable: { decrement: new Prisma.Decimal(amount) },
        },
      });

      // 3. Crear solicitud con estado PENDING
      const withdrawal = await tx.withdrawalRequest.create({
        data: {
          userId,
          amount: new Prisma.Decimal(amount),
          bankDetails: bankDetails as Prisma.InputJsonValue,
          status: 'PENDING',
        },
      });

      // 4. Registrar en ledger
      await ledgerService.recordEntry(
        userId,
        'WITHDRAWAL',
        amount,
        withdrawal.id,
        { type: 'REQUEST', bankDetails }
      );

      return withdrawal;
    });
  }
}
