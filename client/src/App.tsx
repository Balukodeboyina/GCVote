import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { AuthView } from './components/auth/AuthView.js';
import { PresenterDashboard } from './components/dashboard/PresenterDashboard.js';
import { StatusIndicator } from './components/StatusIndicator.js';
import { Layers, Database, Cpu, CheckCircle } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-400 rounded-full animate-spin mb-4" />
        <p className="text-xs text-slate-400 font-medium">Initializing PulseVote Engine...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center">
        {user ? (
          /* Authenticated Presenter Dashboard */
          <PresenterDashboard />
        ) : (
          /* Unauthenticated Landing & Presenter Auth Flow */
          <div className="w-full flex flex-col items-center space-y-12">
            {/* Hero Section */}
            <div className="text-center max-w-3xl space-y-4 pt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-950 border border-brand-800/80 text-brand-300 text-xs font-semibold mb-1">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                PulseVote v0.1 Foundation Active
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Engage Your Audience <br />
                <span className="bg-gradient-to-r from-brand-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                  In Real Time With PulseVote
                </span>
              </h1>

              <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
                Secure presenter authentication and interactive presentation management.
                Sign in below or create an account to start creating presentations.
              </p>
            </div>

            {/* Auth Component (Sign In / Register) */}
            <AuthView />

            {/* Live Core Diagnostics */}
            <div className="w-full flex flex-col items-center pt-8 border-t border-slate-900">
              <div className="text-left w-full max-w-4xl mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                    System Infrastructure Health
                  </h3>
                  <p className="text-xs text-slate-500">Live API and WebSocket connection monitor</p>
                </div>
                <span className="text-xs text-slate-500 font-mono">v0.1 Foundation</span>
              </div>

              <StatusIndicator />
            </div>

            {/* Architectural Modules */}
            <div className="w-full max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm text-slate-100 shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-sky-950/80 text-sky-400 border border-sky-800/50">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-100">Full-Stack Core</h4>
                      <p className="text-xs text-slate-400">Vite React + Express</p>
                    </div>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5">
                    <li className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" /> Presenter registration &amp; login
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" /> Bcrypt password hashing
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" /> JWT authentication cookies
                    </li>
                  </ul>
                </div>

                <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm text-slate-100 shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-indigo-950/80 text-indigo-400 border border-indigo-800/50">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-100">Presentation CRUD</h4>
                      <p className="text-xs text-slate-400">Complete Management</p>
                    </div>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5">
                    <li className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" /> Create &amp; list presentations
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" /> Edit presentation details
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" /> Protected delete confirmation
                    </li>
                  </ul>
                </div>

                <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm text-slate-100 shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-violet-950/80 text-violet-400 border border-violet-800/50">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-100">Security &amp; Data</h4>
                      <p className="text-xs text-slate-400">Prisma ORM SQLite</p>
                    </div>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5">
                    <li className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" /> Strict ownership isolation
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" /> Foreign keys &amp; cascade delete
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" /> Parameterized ORM queries
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full border-t border-slate-900 bg-slate-950/80 py-6 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>PulseVote Platform &bull; Production Architecture Foundation v0.1</span>
          <span>Next Milestone: v0.2 Slide Builder &amp; Questions</span>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
