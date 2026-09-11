import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface PresenterUser {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: PresenterUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PresenterUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('pulsevote_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const checkAuth = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem('pulsevote_token');
      const headers: Record<string, string> = {};
      if (storedToken) {
        headers['Authorization'] = `Bearer ${storedToken}`;
      }

      const res = await fetch('/api/auth/me', {
        headers,
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('pulsevote_token');
      }
    } catch (_err) {
      setUser(null);
      setToken(null);
      localStorage.removeItem('pulsevote_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('pulsevote_token', data.token);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to log in.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) {
        const detailMsg = data.details?.map((d: { message: string }) => d.message).join(', ');
        throw new Error(detailMsg || data.error || 'Registration failed.');
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('pulsevote_token', data.token);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to register.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (_err) {
      // ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('pulsevote_token');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
