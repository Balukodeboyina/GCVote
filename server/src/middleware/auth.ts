import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { prisma } from '../models/prisma.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

interface JwtPayload {
  userId: string;
  email: string;
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined;

    // Check cookie first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ error: 'Authentication required. Please log in.' });
      return;
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      res.status(401).json({ error: 'User account not found or session invalid.' });
      return;
    }

    req.user = user;
    next();
  } catch (_error) {
    res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}
