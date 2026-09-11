import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import http from 'http';
import { io as ClientIO, Socket as ClientSocket } from 'socket.io-client';
import { createApp } from '../src/app.js';
import { SocketManager } from '../src/sockets/index.js';
import { WS_EVENTS } from '@pulsevote/shared';

describe('PulseVote Server Foundation Tests', () => {
  let server: http.Server;
  let serverUrl: string;
  let clientSocket: ClientSocket;

  beforeAll(async () => {
    const app = createApp();
    server = http.createServer(app);
    SocketManager.getInstance().init(server, 'http://localhost:5173');

    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const address = server.address();
        if (address && typeof address !== 'string') {
          serverUrl = `http://localhost:${address.port}`;
        }
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('GET /api/health should return ok and system health structure', async () => {
    const res = await request(server).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service');
    expect(res.body).toHaveProperty('uptimeSeconds');
    expect(res.body).toHaveProperty('connections');
    expect(typeof res.body.connections.activeSockets).toBe('number');
  });

  it('GET /api/nonexistent should return 404', async () => {
    const res = await request(server).get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Endpoint not found');
  });

  it('Socket.IO should connect and reply to pulse:ping with pulse:pong', async () => {
    clientSocket = ClientIO(serverUrl, {
      transports: ['websocket'],
      forceNew: true,
    });

    await new Promise<void>((resolve, reject) => {
      clientSocket.on('connect', () => {
        resolve();
      });
      clientSocket.on('connect_error', (err) => {
        reject(err);
      });
    });

    expect(clientSocket.connected).toBe(true);

    const pongPromise = new Promise<{ timestamp: string; clientId: string }>((resolve) => {
      clientSocket.on(WS_EVENTS.PONG, (data) => {
        resolve(data);
      });
    });

    clientSocket.emit(WS_EVENTS.PING);

    const pongData = await pongPromise;
    expect(pongData).toHaveProperty('timestamp');
    expect(pongData).toHaveProperty('clientId');
    expect(pongData.clientId).toBe(clientSocket.id);
  });
});
