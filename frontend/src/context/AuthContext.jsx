import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const STORAGE_KEY = 'linguasign_session';
const API_URL = 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Persistir sesión en sessionStorage
  useEffect(() => {
    if (user) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  // ── Login ──────────────────────────────────────────────────────────────────
  // Recibe el objeto user del backend (con id, name, email, role, progress)
  const login = useCallback((userData) => {
    const session = {
      ...userData,
      loginTime: new Date().toISOString(),
    };
    setUser(session);

    return session;
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('vento_token');
    localStorage.removeItem('vento_user');
    sessionStorage.removeItem('vento_token');
    sessionStorage.removeItem('vento_user');
    sessionStorage.removeItem('vento_welcomed_this_session');
  }, []);

  // ── Guardar progreso (local + Firebase vía Node.js) ────────────────────────
  const updateProgress = useCallback((moduleKey, progressData) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        progress: {
          ...(prev.progress || {}),
          [moduleKey]: {
            ...(prev.progress?.[moduleKey] || {}),
            ...progressData,
          },
        },
      };

      // Guardar en Firebase vía backend Node.js
      if (prev.id) {
        const token = sessionStorage.getItem('vento_token');
        fetch(`${API_URL}/api/progress/${prev.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            module: moduleKey,
            data: updated.progress[moduleKey],
          }),
        }).catch(err => console.warn('Progress sync error:', err));
      }

      return updated;
    });
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isLoading,
    setIsLoading,
    login,
    logout,
    updateProgress,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
