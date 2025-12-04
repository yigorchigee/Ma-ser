import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { dataClient } from '@/api/dataClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => dataClient.auth.getSession());

  const refreshSession = async () => {
    try {
      const user = await dataClient.auth.me();
      setSession({ user });
      return user;
    } catch {
      setSession(null);
      return null;
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const loginWithGoogle = async (payload) => {
    const result = await dataClient.auth.loginWithGoogle(payload);
    setSession(result.session);
    return result;
  };

  const loginWithEmail = async (payload) => {
    const result = await dataClient.auth.loginWithEmail(payload);
    setSession(result.session);
    return result;
  };

  const registerWithEmail = async (payload) => {
    const result = await dataClient.auth.registerWithEmail(payload);
    setSession(result.session);
    return result;
  };

  const logout = async () => {
    await dataClient.auth.logout();
    setSession(null);
  };

  const value = useMemo(
    () => ({
      user: session?.user || null,
      isAuthenticated: Boolean(session?.user),
      loginWithGoogle,
      loginWithEmail,
      registerWithEmail,
      refreshSession,
      logout,
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
