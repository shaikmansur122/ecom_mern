import { createContext, useContext, useState } from 'react';
import { api } from '../api.js';

const AuthContext = createContext(null);
const STORAGE_KEY = 'shopnest.auth';

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession); // { user, token } | null

  const saveSession = (value) => {
    setSession(value);
    try {
      if (value) localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage unavailable (e.g. private mode); the session just won't survive a reload.
    }
  };

  const login = async (email, password) =>
    saveSession(await api('/auth/login', { method: 'POST', body: { email, password } }));

  const register = async (name, email, password) =>
    saveSession(await api('/auth/register', { method: 'POST', body: { name, email, password } }));

  const logout = () => saveSession(null);

  // Calls the API with the user's token and logs out if the server rejects it.
  const authedApi = async (path, options = {}) => {
    try {
      return await api(path, { ...options, token: session?.token });
    } catch (err) {
      if (err.status === 401) logout();
      throw err;
    }
  };

  const value = { user: session?.user ?? null, login, register, logout, authedApi };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
