import { createContext, useContext, useState, useEffect } from 'react';
import { adminAuthAPI } from '../services/adminApi';
import toast from 'react-hot-toast';

const AdminAuthContext = createContext(null);

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem('adminUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('adminToken'));
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!token;

  useEffect(() => {
    if (token && !admin) {
      setLoading(true);
      adminAuthAPI
        .getProfile()
        .then((res) => {
          setAdmin(res.data.admin);
          localStorage.setItem('adminUser', JSON.stringify(res.data.admin));
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    }
  }, [token]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await adminAuthAPI.login(credentials);
      const { token: tk, admin: a } = res.data;
      setToken(tk);
      setAdmin(a);
      localStorage.setItem('adminToken', tk);
      localStorage.setItem('adminUser', JSON.stringify(a));
      toast.success(`Welcome back, ${a.name}!`);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, isAuthenticated, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
