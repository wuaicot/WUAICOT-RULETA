import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/client';

const prisma = new PrismaClient();

export class AdminController {
  async approveDeposit(req: Request, res: Response) {
    try {
      const { depositId } = req.body;
      const adminService = new (require('../services/AdminService')).AdminService();
      await adminService.approveDeposit(depositId);
      res.status(200).json({ message: 'Deposit approved successfully' });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async rejectDeposit(req: Request, res: Response) {
    try {
      const { depositId, reason } = req.body;
      const adminService = new (require('../services/AdminService')).AdminService();
      await adminService.rejectDeposit(depositId, reason);
      res.status(200).json({ message: 'Deposit rejected successfully' });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getPendingDeposits(req: Request, res: Response) {
    try {
      const deposits = await prisma.depositRequest.findMany({
        where: { status: 'PENDING' },
        include: { user: true }
      });
      res.status(200).json(deposits);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching deposits' });
    }
  }
}
