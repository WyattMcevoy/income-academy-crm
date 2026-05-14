import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const AuthContext = createContext(null);
const STORAGE_KEY = 'ia_crm_auth';

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (auth) localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    else localStorage.removeItem(STORAGE_KEY);
  }, [auth]);

  const login = async (email, password) => {
    const data = await api('/api/auth/login', { method: 'POST', body: { email, password } });
    setAuth(data);
  };
  const register = async (email, password, name) => {
    const data = await api('/api/auth/register', { method: 'POST', body: { email, password, name } });
    setAuth(data);
  };
  const logout = () => setAuth(null);

  // Consume a JWT from a trusted external tenant (Kick Start CRM, etc.)
  // Used by the /credit-builder/sso landing page.
  const ssoConsume = async (token) => {
    const data = await api('/api/auth/sso', { method: 'POST', body: { token } });
    setAuth(data);
    return data;
  };

  return (
    <AuthContext.Provider value={{ auth, login, register, logout, ssoConsume }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
