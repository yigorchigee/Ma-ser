import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import './styles.css';

import Layout from './Layout';
import MaaserTracker from './pages/MaaserTracker';
import Transactions from './pages/Transactions';
import Donate from './pages/Donate';
import Settings from './pages/Settings';
import Login from './pages/Login';
import ProtectedRoute from './auth/ProtectedRoute';
import { AuthProvider } from './auth/AuthContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={(
                <ProtectedRoute>
                  <Layout currentPageName="Dashboard">
                    <MaaserTracker />
                  </Layout>
                </ProtectedRoute>
              )}
            />
            <Route
              path="/transactions"
              element={(
                <ProtectedRoute>
                  <Layout currentPageName="Transactions">
                    <Transactions />
                  </Layout>
                </ProtectedRoute>
              )}
            />
            <Route
              path="/donate"
              element={(
                <ProtectedRoute>
                  <Layout currentPageName="Donate">
                    <Donate />
                  </Layout>
                </ProtectedRoute>
              )}
            />
            <Route
              path="/settings"
              element={(
                <ProtectedRoute>
                  <Layout currentPageName="Settings">
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              )}
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors closeButton />
      </AuthProvider>
    </QueryClientProvider>
  );
}

const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
