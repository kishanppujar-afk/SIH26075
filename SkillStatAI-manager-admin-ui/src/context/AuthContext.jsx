import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('skillstat_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('skillstat_admin_token') || null;
  });

  async function login(emailOrId, password) {
    const res = await api.login(emailOrId, password);
    const role = res.role;

    if (role === 'employee') {
      throw new Error('Access denied: Employee accounts must log in via the Employee Portal.');
    }

    const userData = res.employee || {
      id: res.sub || emailOrId,
      name: emailOrId,
      role: role,
    };
    userData.role = role;

    localStorage.setItem('skillstat_admin_token', res.access_token);
    localStorage.setItem('skillstat_admin_user', JSON.stringify(userData));

    setToken(res.access_token);
    setUser(userData);

    return { user: userData, role: role, token: res.access_token };
  }

  function logout() {
    localStorage.removeItem('skillstat_admin_token');
    localStorage.removeItem('skillstat_admin_user');
    setUser(null);
    setToken(null);
  }

  // currentManager alias for backwards-compatibility with existing manager components
  const currentManager = user && user.role === 'manager' ? user : user;

  return (
    <AuthContext.Provider value={{ user, currentManager, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}