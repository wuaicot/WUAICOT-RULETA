import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { nickname, age, pin } = req.body;
      const pinHash = await bcrypt.hash(pin, 10);
      
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { nickname, age: Number(age), pinHash }
        });

        await tx.wallet.create({
          data: { userId: user.id }
        });

        return user;
      });

      const token = jwt.sign({ userId: result.id }, JWT_SECRET, { expiresIn: '24h' });
      res.status(201).json({ token, user: { id: result.id, nickname: result.nickname } });
    } catch (error) {
      res.status(400).json({ error: 'Error al registrar usuario: ' + (error as Error).message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { nickname, pin } = req.body;
      const user = await prisma.user.findUnique({ where: { nickname } });
      
      if (!user || !(await bcrypt.compare(pin, user.pinHash))) {
        return res.status(401).json({ error: 'Nickname o PIN incorrecto' });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
      res.status(200).json({ token, user: { id: user.id, nickname: user.nickname } });
    } catch (error) {
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  }
}
