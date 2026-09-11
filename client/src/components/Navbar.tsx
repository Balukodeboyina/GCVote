import { Activity, Radio, UserCheck } from 'lucide-react';
import { Badge } from './ui/Badge.js';
import { useAuth } from '../context/AuthContext.js';

export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Pulse<span className="text-brand-400">Vote</span>
              </span>
              <Badge variant="info">v0.1 Foundation</Badge>
            </div>
            <p className="text-xs text-slate-400 font-medium">Real-Time Interactive Presentation Platform</p>
          </div>
        </div>

        {/* Right Status */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">{user.name}</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <Radio className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
              <span>Presenter Portal</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
