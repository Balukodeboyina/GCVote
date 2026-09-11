import { Navbar } from './components/Navbar.js';
import { StatusIndicator } from './components/StatusIndicator.js';
import { Card } from './components/ui/Card.js';
import { Badge } from './components/ui/Badge.js';
import { Layers, Database, Cpu, CheckCircle } from 'lucide-react';

export function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col items-center">
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-950 border border-brand-800/80 text-brand-300 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            Milestone v0.1 Foundation Initialized
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Engage Your Audience <br />
            <span className="bg-gradient-to-r from-brand-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              In Real Time With PulseVote
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            High-performance live audience response and interactive presentation platform.
            Engineered with modern WebSockets, relational data modeling, and responsive architecture.
          </p>
        </div>

        {/* Live System Diagnostics & Realtime Dashboard */}
        <div className="w-full flex flex-col items-center mb-12">
          <div className="text-left w-full max-w-4xl mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Live Core Infrastructure Health
            </h2>
            <span className="text-xs text-slate-500 font-mono">v0.1 Foundation</span>
          </div>

          <StatusIndicator />
        </div>

        {/* Architecture & Milestone Foundation Overview */}
        <div className="w-full max-w-4xl">
          <div className="mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              v0.1 Architectural Foundation Modules
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-sky-950/80 text-sky-400 border border-sky-800/50">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-100">Full-Stack Core</h4>
                  <p className="text-xs text-slate-400">Vite React 18 + Node TS</p>
                </div>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" /> Shared TypeScript contracts
                </li>
                <li className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" /> Fast HMR & ESM bundler
                </li>
                <li className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" /> Tailwind design primitives
                </li>
              </ul>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-indigo-950/80 text-indigo-400 border border-indigo-800/50">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-100">Realtime Engine</h4>
                  <p className="text-xs text-slate-400">Socket.IO v4 Protocol</p>
                </div>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" /> Bi-directional ping/pong
                </li>
                <li className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" /> Room abstraction contracts
                </li>
                <li className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" /> Automatic client reconnect
                </li>
              </ul>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-violet-950/80 text-violet-400 border border-violet-800/50">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-100">Data Schema</h4>
                  <p className="text-xs text-slate-400">Prisma Relational Models</p>
                </div>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" /> Zero-config SQLite local dev
                </li>
                <li className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" /> Presenter & Slide relations
                </li>
                <li className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" /> Live Sessions & Responses
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>PulseVote Platform &bull; Production Architecture Foundation v0.1</span>
          <span>Next Milestone: v0.2 Presenter Authentication &amp; Dashboard</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
