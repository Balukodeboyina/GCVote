import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { WS_EVENTS } from '@pulsevote/shared';

export interface SocketManagerStats {
  activeSockets: number;
  activeSessions: number;
}

export class SocketManager {
  private static instance: SocketManager;
  private io: SocketIOServer | null = null;
  private activeSocketsCount = 0;
  private activeRooms = new Set<string>();

  private constructor() {}

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public init(httpServer: HttpServer, clientUrl: string): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 30000,
      pingInterval: 25000,
    });

    this.setupListeners();
    return this.io;
  }

  private setupListeners(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      this.activeSocketsCount++;

      // Heartbeat ping-pong
      socket.on(WS_EVENTS.PING, () => {
        socket.emit(WS_EVENTS.PONG, {
          timestamp: new Date().toISOString(),
          clientId: socket.id,
        });
      });

      // Disconnect
      socket.on('disconnect', () => {
        this.activeSocketsCount = Math.max(0, this.activeSocketsCount - 1);
      });
    });
  }

  public getStats(): SocketManagerStats {
    return {
      activeSockets: this.activeSocketsCount,
      activeSessions: this.activeRooms.size,
    };
  }

  public getIO(): SocketIOServer | null {
    return this.io;
  }
}
