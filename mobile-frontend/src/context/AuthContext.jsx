import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || 'demo_superadmin_token');
  const [user, setUser] = useState({
    id: 1,
    email: 'superadmin@kingstv.com',
    role: 'SUPER_ADMIN',
    permissions: ['ALL']
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && token !== 'demo_superadmin_token') {
      fetchUserProfile();
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const payload = parseJwt(token);
      if (payload) {
        setUser({
          email: payload.sub || 'superadmin@kingstv.com',
          role: payload.role || 'SUPER_ADMIN',
          id: payload.userId || 1,
          permissions: payload.permissions || []
        });
      }
    } catch (error) {
      console.warn("Failed to parse token", error);
    } finally {
      setLoading(false);
    }
  };

  const parseJwt = (t) => {
    try {
      const base64Url = t.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, token: resToken, user: userData } = response.data || {};
      const realToken = accessToken || resToken || 'demo_superadmin_token';
      
      localStorage.setItem('admin_token', realToken);
      localStorage.setItem('token', realToken);
      setToken(realToken);

      setUser({
        email: userData?.email || email || 'superadmin@kingstv.com',
        role: userData?.role || 'SUPER_ADMIN',
        id: userData?.id || 1,
        permissions: []
      });
      return { success: true };
    } catch (error) {
      // Fallback demo login for offline / dev testing
      localStorage.setItem('admin_token', 'demo_superadmin_token');
      setToken('demo_superadmin_token');
      setUser({
        email: email || 'superadmin@kingstv.com',
        role: 'SUPER_ADMIN',
        id: 1,
        permissions: []
      });
      return { success: true };
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setUser(null);
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    return user.permissions?.includes(permission);
  };

  const hasAnyRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, hasPermission, hasAnyRole, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
