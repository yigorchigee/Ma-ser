import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children, allowWithoutPin = false }) {
  const { isAuthenticated, isPinVerified } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allowWithoutPin && !isPinVerified) {
    return <Navigate to="/create-pin" replace state={{ from: location.pathname }} />;
  }

  return children;
}
