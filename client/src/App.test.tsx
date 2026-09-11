import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App.js';

// Mock Socket hook and fetch for isolated UI unit testing
vi.mock('./hooks/useSocket.js', () => ({
  useSocket: () => ({
    isConnected: true,
    socketId: 'mock-socket-id-12345',
    latencyMs: 12,
    sendPing: vi.fn(),
  }),
}));

globalThis.fetch = vi.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        status: 'ok',
        service: 'PulseVote Backend API & Realtime Server',
        version: '0.1.0',
        uptimeSeconds: 42,
        connections: { activeSessions: 0, activeSockets: 1 },
      }),
  })
) as unknown as typeof fetch;

describe('PulseVote Client App Foundation Tests', () => {
  it('renders PulseVote brand and v0.1 Foundation badge', async () => {
    render(<App />);
    const brandMatches = screen.getAllByText(/Pulse/i);
    expect(brandMatches.length).toBeGreaterThan(0);
    const badgeMatches = screen.getAllByText(/v0.1 Foundation/i);
    expect(badgeMatches.length).toBeGreaterThan(0);
    expect(await screen.findByText(/Operational/i)).toBeInTheDocument();
  });

  it('renders Backend API and WebSocket Engine status cards', async () => {
    render(<App />);
    expect(screen.getByText('Backend API')).toBeInTheDocument();
    expect(screen.getByText('WebSocket Engine')).toBeInTheDocument();
    expect(await screen.findByText(/Operational/i)).toBeInTheDocument();
  });

  it('renders architectural foundation cards', async () => {
    render(<App />);
    expect(screen.getByText('Full-Stack Core')).toBeInTheDocument();
    expect(screen.getByText('Realtime Engine')).toBeInTheDocument();
    expect(screen.getByText('Data Schema')).toBeInTheDocument();
    expect(await screen.findByText(/Operational/i)).toBeInTheDocument();
  });
});
