import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// Check if backend connectivity is truly unavailable (network error, not auth error)
const isNetworkError = (err) => {
  return !err.response || err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED';
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!token;

  useEffect(() => {
    // If a stale demo token is stored but the backend is now running,
    // clear it and force the user to log in with a real account.
    if (token && token.startsWith('demo-jwt-token-')) {
      // Test if backend is reachable
      authAPI.getProfile()
        .then(() => {
          // Backend is up but profile call with demo token worked — keep session
        })
        .catch((err) => {
          if (err.response?.status === 401 || err.response?.status === 503) {
            // Backend is running but demo token rejected — force real login
            logout();
            toast.error('Your demo session has expired. Please register or log in.');
          }
          // Network error = backend still down, keep demo session
        });
      return;
    }

    if (token && !user) {
      setLoading(true);
      authAPI
        .getProfile()
        .then((res) => {
          const u = res.data.user || res.data;
          setUser(u);
          localStorage.setItem('user', JSON.stringify(u));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    }
  }, [token]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authAPI.login(credentials);
      const { token: tk, user: u } = res.data;
      setToken(tk);
      setUser(u);
      localStorage.setItem('token', tk);
      localStorage.setItem('user', JSON.stringify(u));
      toast.success('Login successful!');
      return { success: true };
    } catch (err) {
      // Only fall back to demo session on network error (backend unavailable)
      // Do NOT swallow authentication failures (wrong password, user not found)
      if (isNetworkError(err)) {
        const name = credentials.email?.split('@')[0] || 'Student';
        const demoUser = {
          _id: `demo_${Date.now()}`,
          name: name.charAt(0).toUpperCase() + name.slice(1),
          email: credentials.email || 'student@interviewcoach.ai',
          role: 'student',
          isDemoUser: true,
        };
        const demoToken = 'demo-jwt-token-' + Date.now();
        setToken(demoToken);
        setUser(demoUser);
        localStorage.setItem('token', demoToken);
        localStorage.setItem('user', JSON.stringify(demoUser));
        toast.success('Backend unavailable — running in Demo Mode');
        return { success: true, isDemoMode: true };
      }

      // Real error (wrong password, user not found, etc.) — propagate it
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      const res = await authAPI.register(data);
      const { token: tk, user: u } = res.data;
      setToken(tk);
      setUser(u);
      localStorage.setItem('token', tk);
      localStorage.setItem('user', JSON.stringify(u));
      toast.success('Registration successful! Welcome aboard.');
      return { success: true };
    } catch (err) {
      // Only fall back to demo mode on network error
      if (isNetworkError(err)) {
        const demoUser = {
          _id: `demo_${Date.now()}`,
          name: data.name || 'New Student',
          email: data.email || 'student@interviewcoach.ai',
          role: 'student',
          isDemoUser: true,
        };
        const demoToken = 'demo-jwt-token-' + Date.now();
        setToken(demoToken);
        setUser(demoUser);
        localStorage.setItem('token', demoToken);
        localStorage.setItem('user', JSON.stringify(demoUser));
        toast.success('Backend unavailable — running in Demo Mode');
        return { success: true, isDemoMode: true };
      }

      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updated) => {
    const merged = { ...user, ...updated };
    setUser(merged);
    localStorage.setItem('user', JSON.stringify(merged));
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
