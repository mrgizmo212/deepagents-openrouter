import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { NuqsAdapter } from 'nuqs/adapters/react';
import { ClientProvider } from './providers/ClientProvider';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:2024';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NuqsAdapter>
      <AuthProvider>
        <ClientProvider deploymentUrl={API_URL}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ClientProvider>
      </AuthProvider>
    </NuqsAdapter>
  </React.StrictMode>
);
