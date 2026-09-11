import { useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket.js';
import { Card } from './ui/Card.js';
import { Button } from './ui/Button.js';
import { Badge } from './ui/Badge.js';
import { SystemHealth } from '@pulsevote/shared';
import { CheckCircle2, XCircle, RefreshCw, Zap, Wifi, Server } from 'lucide-react';

export function StatusIndicator() {
  const { isConnected, socketId, latencyMs, sendPing } = useSocket();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoadingHealth(true);
    setHealthError(null);
    try {
      const res = await fetch('/api/health');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data: SystemHealth = await res.json();
      setHealth(data);
    } catch (err) {
      setHealthError(err instanceof Error ? err.message : 'Failed to reach API');
      setHealth(null);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
      {/* HTTP API Health Card */}
      <Card className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-slate-800 text-brand-400">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg text-slate-100">Backend API</h3>
            </div>
            {health?.status === 'ok' ? (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Operational
              </Badge>
            ) : healthError ? (
              <Badge variant="default" className="text-rose-400 border-rose-800/60 bg-rose-950/80 gap-1">
                <XCircle className="w-3.5 h-3.5" /> Unreachable
              </Badge>
            ) : (
              <Badge variant="warning">Checking...</Badge>
            )}
          </div>

          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Service</span>
              <span className="font-mono text-xs">{health?.service || 'PulseVote API'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Version</span>
              <span className="font-mono text-xs">{health?.version || 'v0.1.0'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Server Uptime</span>
              <span className="font-mono text-xs">
                {health?.uptimeSeconds !== undefined ? `${health.uptimeSeconds}s` : '—'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Active DB Mode</span>
              <span className="font-mono text-xs text-sky-400">SQLite (Local Zero-Config)</span>
            </div>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchHealth}
            disabled={loadingHealth}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loadingHealth ? 'animate-spin' : ''}`} />
            Refresh Health
          </Button>
          <span className="text-[11px] text-slate-500">Auto-polls every 15s</span>
        </div>
      </Card>

      {/* Realtime WebSocket Card */}
      <Card className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-slate-800 text-pulse-violet">
                <Wifi className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg text-slate-100">WebSocket Engine</h3>
            </div>
            {isConnected ? (
              <Badge variant="success" className="gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-0.5" /> Connected
              </Badge>
            ) : (
              <Badge variant="default" className="text-amber-400 border-amber-800/60 bg-amber-950/80 gap-1">
                Connecting...
              </Badge>
            )}
          </div>

          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Protocol</span>
              <span className="font-mono text-xs">Socket.IO (v4)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Socket ID</span>
              <span className="font-mono text-xs truncate max-w-[160px] text-slate-400">
                {socketId || 'Pending handshake...'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Heartbeat Latency</span>
              <span className="font-mono text-xs">
                {latencyMs !== null ? (
                  <span className="text-emerald-400 font-semibold">{latencyMs} ms</span>
                ) : (
                  '—'
                )}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Channel State</span>
              <span className="font-mono text-xs text-brand-400">Bi-directional Ready</span>
            </div>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between">
          <Button
            size="sm"
            variant="primary"
            onClick={sendPing}
            disabled={!isConnected}
            className="text-xs"
          >
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            Send Test Ping
          </Button>
          <span className="text-[11px] text-slate-500">Measures round-trip</span>
        </div>
      </Card>
    </div>
  );
}
