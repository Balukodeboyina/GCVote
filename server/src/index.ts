import http from 'http';
import { createApp } from './app.js';
import { ENV } from './config/env.js';
import { SocketManager } from './sockets/index.js';

const app = createApp();
const server = http.createServer(app);

// Initialize Socket.io
SocketManager.getInstance().init(server, ENV.CLIENT_URL);

server.listen(ENV.PORT, () => {
  console.log(`[PulseVote] Server listening on http://localhost:${ENV.PORT}`);
  console.log(`[PulseVote] Environment: ${ENV.NODE_ENV}`);
  console.log(`[PulseVote] Client origin allowed: ${ENV.CLIENT_URL}`);
});

export { app, server };
