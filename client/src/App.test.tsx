import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App.js';

// Mock Socket hook
vi.mock('./hooks/useSocket.js', () => ({
  useSocket: () => ({
    isConnected: true,
    socketId: 'mock-socket-id-12345',
    latencyMs: 12,
    sendPing: vi.fn(),
  }),
}));

describe('PulseVote Client App Foundation Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/auth/me')) {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: 'Not authenticated' }),
        });
      }
      if (url.includes('/api/health')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              status: 'ok',
              service: 'PulseVote Backend API & Realtime Server',
              version: '0.1.0',
              uptimeSeconds: 42,
              connections: { activeSessions: 0, activeSockets: 1 },
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    }) as unknown as typeof fetch;
  });

  it('renders PulseVote brand and v0.1 Foundation badge', async () => {
    render(<App />);
    const brandMatches = await screen.findAllByText(/Pulse/i);
    expect(brandMatches.length).toBeGreaterThan(0);
    const badgeMatches = screen.getAllByText(/v0.1 Foundation/i);
    expect(badgeMatches.length).toBeGreaterThan(0);
  });

  it('renders presenter sign-in form by default with email and password fields', async () => {
    render(<App />);
    expect(await screen.findByText('Welcome Back Presenter')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('presenter@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In to Dashboard/i })).toBeInTheDocument();
  });

  it('switches to create account tab and shows full name input', async () => {
    render(<App />);
    // Wait for auth initialization
    expect(await screen.findByText('Welcome Back Presenter')).toBeInTheDocument();

    const buttons = screen.getAllByRole('button', { name: /Create Account/i });
    // First button is the mode tab
    fireEvent.click(buttons[0]);

    expect(screen.getByText('Create Presenter Account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Dr. Alex Morgan')).toBeInTheDocument();
  });

  it('populates fields when clicking Quick-Fill Demo Credentials', async () => {
    render(<App />);
    const demoButton = await screen.findByRole('button', { name: /Quick-Fill Demo Credentials/i });
    fireEvent.click(demoButton);

    const emailInput = screen.getByPlaceholderText('presenter@example.com') as HTMLInputElement;
    expect(emailInput.value).toBe('presenter@pulsevote.com');
  });

  it('renders PresenterDashboard when user is authenticated', async () => {
    // Mock authenticated /api/auth/me response
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/auth/me')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              user: {
                id: 'presenter-user-123',
                name: 'Dr. Evelyn Reed',
                email: 'evelyn@pulsevote.com',
              },
            }),
        });
      }
      if (url.includes('/api/presentations')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              presentations: [
                {
                  id: 'pres-1',
                  title: 'Annual Research Symposium',
                  description: 'Interactive presentation for annual conference',
                  ownerId: 'presenter-user-123',
                  createdAt: '2026-09-01T10:00:00.000Z',
                  updatedAt: '2026-09-01T12:00:00.000Z',
                },
              ],
              total: 1,
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    }) as unknown as typeof fetch;

    render(<App />);

    const userMatches = await screen.findAllByText('Dr. Evelyn Reed');
    expect(userMatches.length).toBeGreaterThan(0);
    expect(screen.getByText('Total Presentations')).toBeInTheDocument();
    expect(screen.getByText('Annual Research Symposium')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Presentation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Out/i })).toBeInTheDocument();
  });
});
