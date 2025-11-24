import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import Layout from './Layout';
import MaaserTracker from './pages/MaaserTracker';
import Transactions from './pages/Transactions';
import Donate from './pages/Donate';
import Settings from './pages/Settings';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/maasertracker"
            element={(
              <Layout currentPageName="MaaserTracker">
                <MaaserTracker />
              </Layout>
            )}
          />
          <Route
            path="/transactions"
            element={(
              <Layout currentPageName="Transactions">
                <Transactions />
              </Layout>
            )}
          />
          <Route
            path="/donate"
            element={(
              <Layout currentPageName="Donate">
                <Donate />
              </Layout>
            )}
          />
          <Route
            path="/settings"
            element={(
              <Layout currentPageName="Settings">
                <Settings />
              </Layout>
            )}
          />
          <Route path="/" element={<Navigate to="/maasertracker" replace />} />
          <Route path="*" element={<Navigate to="/maasertracker" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors closeButton />
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
