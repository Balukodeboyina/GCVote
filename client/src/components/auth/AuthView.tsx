import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { Card } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { LogIn, UserPlus, AlertCircle, Sparkles } from 'lucide-react';

export function AuthView() {
  const { login, register, error, clearError } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localValidation, setLocalValidation] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalValidation(null);
    clearError();

    if (!email.trim() || !password) {
      setLocalValidation('Please fill in all required fields.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setLocalValidation('Please provide your full name.');
        return;
      }
      if (password.length < 8) {
        setLocalValidation('Password must be at least 8 characters.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
    } catch (_err) {
      // Handled by AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = () => {
    setName('Balu Presenter');
    setEmail('presenter@pulsevote.com');
    setPassword('PulseVote2026!');
    setLocalValidation(null);
  };

  const activeError = localValidation || error;

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="p-8 border-slate-800 bg-slate-900/90 shadow-2xl">
        {/* Mode Selector Tabs */}
        <div className="flex rounded-lg bg-slate-950/80 p-1 mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              clearError();
              setLocalValidation(null);
            }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              clearError();
              setLocalValidation(null);
            }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
              mode === 'register'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Create Account
          </button>
        </div>

        {/* Title */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-white">
            {mode === 'login' ? 'Welcome Back Presenter' : 'Create Presenter Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login'
              ? 'Sign in to access your presentations and live controls'
              : 'Register to host live polls and interactive presentations'}
          </p>
        </div>

        {/* Error Alert */}
        {activeError && (
          <div className="mb-5 p-3.5 rounded-lg bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">{activeError}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Alex Morgan"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                disabled={submitting}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="presenter@example.com"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
              disabled={submitting}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Password
              </label>
              {mode === 'register' && (
                <span className="text-[11px] text-slate-500">Min. 8 characters</span>
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
              disabled={submitting}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={submitting}
            className="w-full mt-2"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : mode === 'login' ? (
              'Sign In to Dashboard'
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        {/* Quick Demo Helper */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
          <button
            type="button"
            onClick={handleQuickDemo}
            className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            Quick-Fill Demo Credentials
          </button>
        </div>
      </Card>
    </div>
  );
}
