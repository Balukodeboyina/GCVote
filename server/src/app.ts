import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env.js';
import { SocketManager } from './sockets/index.js';
import { SystemHealth } from '@pulsevote/shared';
import authRoutes from './routes/authRoutes.js';
import presentationRoutes from './routes/presentationRoutes.js';

export function createApp(): Express {
  const app = express();

  app.use(
    cors({
      origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
    })
  );

  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    const socketStats = SocketManager.getInstance().getStats();

    const health: SystemHealth = {
      status: 'ok',
      service: 'PulseVote Backend API & Realtime Server',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      connections: {
        activeSessions: socketStats.activeSessions,
        activeSockets: socketStats.activeSockets,
      },
    };

    res.status(200).json(health);
  });

  // Authentication routes
  app.use('/api/auth', authRoutes);

  // Presentation CRUD routes
  app.use('/api/presentations', presentationRoutes);

  // 404 handler for unknown API routes
  app.use('/api/*', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  return app;
}
