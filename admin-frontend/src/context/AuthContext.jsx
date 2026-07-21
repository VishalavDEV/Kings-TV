import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('admin_jwt_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await axiosInstance.get('/api/admin/auth/me');
      setUser(res.data);
      setPermissions(res.data.permissions || []);
    } catch {
      localStorage.removeItem('admin_jwt_token');
      setUser(null);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = (userData, token) => {
    localStorage.setItem('admin_jwt_token', token);
    setUser(userData);
    setPermissions(userData.permissions || []);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('admin_refresh_token');
      await axiosInstance.post('/api/admin/auth/logout', { refreshToken });
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('admin_jwt_token');
      localStorage.removeItem('admin_refresh_token');
      setUser(null);
      setPermissions([]);
    }
  };

  const hasPermission = (moduleKey) => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    return permissions.includes(moduleKey);
  };

  return (
    <AuthContext.Provider value={{ user, permissions, loading, login, logout, hasPermission, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
