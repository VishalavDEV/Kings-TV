import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem('king24x7_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = (userData) => {
    const userSession = {
      ...userData,
      isLoggedIn: true,
      loggedInAt: new Date().toISOString()
    };
    setSession(userSession);
    localStorage.setItem('king24x7_session', JSON.stringify(userSession));
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('king24x7_session');
  };

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
