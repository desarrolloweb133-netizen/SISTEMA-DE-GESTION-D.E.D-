import React from 'react';
import './index.css';
import { createRoot } from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';

// --- CRITICAL ERROR CAPTURE ---
// This will catch any error that would otherwise result in a white screen
const reportError = (msg: string, stack?: string) => {
  console.error('CRITICAL ERROR:', msg, stack);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
            <div style="padding: 40px; background: #fff; color: #444; font-family: sans-serif; max-width: 800px; margin: 40px auto; border-radius: 20px; border: 4px solid #fecaca; box-shadow: 0 10px 30px rgba(0,0,0,0.1)">
                <h1 style="color: #ef4444; margin-top: 0">🛑 Error de Aplicación</h1>
                <p style="font-weight: bold">El sistema no pudo iniciarse correctamente.</p>
                <div style="background: #f8fafc; padding: 20px; border-radius: 12px; font-family: monospace; font-size: 13px; overflow-x: auto; border: 1px solid #e2e8f0">
                    <p style="color: #ef4444; margin-top: 0"><strong>Error:</strong> ${msg}</p>
                    ${stack ? `<details open><summary>Stack Trace</summary><pre style="white-space: pre-wrap; margin-top: 10px">${stack}</pre></details>` : ''}
                </div>
                <button onclick="window.location.reload()" style="margin-top: 20px; padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer">Reintentar</button>
            </div>
        `;
  }
};

window.addEventListener('error', (event) => {
  reportError(event.message, event.error?.stack);
});

window.addEventListener('unhandledrejection', (event) => {
  reportError('Promise Rejection: ' + event.reason);
});

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("No se pudo encontrar el elemento #root en el DOM.");
  }

  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
} catch (e: any) {
  reportError(e.message, e.stack);
}