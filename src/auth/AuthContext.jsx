import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { dataClient } from '@/api/dataClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => dataClient.auth.getSession());
  const [isPinVerified, setIsPinVerified] = useState(() => Boolean(dataClient.auth.getSession()));

  const refreshSession = async () => {
    try {
      const user = await dataClient.auth.me();
      setSession({ user });
      setIsPinVerified(true);
      return user;
    } catch {
      setSession(null);
      setIsPinVerified(false);
      return null;
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const loginWithGoogle = async (payload) => {
    const result = await dataClient.auth.loginWithGoogle(payload);
    setSession(result.session);
    setIsPinVerified(false);
    return result;
  };

  const loginWithEmail = async (payload) => {
    const result = await dataClient.auth.loginWithEmail(payload);
    setSession(result.session);
    setIsPinVerified(false);
    return result;
  };

  const registerWithEmail = async (payload) => {
    const result = await dataClient.auth.registerWithEmail(payload);
    setSession(result.session);
    setIsPinVerified(false);
    return result;
  };

  const markPinVerified = () => setIsPinVerified(true);

  const logout = async () => {
    await dataClient.auth.logout();
    setSession(null);
    setIsPinVerified(false);
  };

  const value = useMemo(
    () => ({
      user: session?.user || null,
      isAuthenticated: Boolean(session?.user),
      isPinVerified,
      loginWithGoogle,
      loginWithEmail,
      registerWithEmail,
      refreshSession,
      markPinVerified,
      logout,
    }),
    [session, isPinVerified]
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
