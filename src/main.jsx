import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import App from './App.jsx';
import './index.css';

const GOOGLE_CLIENT_ID = "865685222965-kb85u59k150mlq8pqgho9h4ap5pt2v71.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);

// Active unregistration of service worker and cache clear-up to resolve caching/white-screen reload bugs
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister()
        .then(() => console.log('[ServiceWorker] Unregistered successfully.'))
        .catch(err => console.error('[ServiceWorker] Unregistration failed:', err));
    }
  });
}
if (window.caches) {
  caches.keys().then((keys) => {
    keys.forEach((key) => {
      caches.delete(key)
        .then(() => console.log(`[CacheStorage] Cleared database: ${key}`))
        .catch(err => console.error(`[CacheStorage] Failed to clear: ${key}`, err));
    });
  });
}