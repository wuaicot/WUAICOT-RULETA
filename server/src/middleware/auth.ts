import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[AUTH] Request received: ${req.method} ${req.url}`);
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    console.error("[AUTH] No token provided");
    return res.status(401).json({ error: 'Acceso no autorizado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    console.log(`[AUTH] User authenticated: ${decoded.userId}`);
    (req as any).user = decoded;
    next();
  } catch (err) {
    console.error("[AUTH] Invalid token:", err);
    res.status(401).json({ error: 'Token inválido' });
  }
};
