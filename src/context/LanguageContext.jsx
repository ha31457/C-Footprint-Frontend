import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('app-language') || 'en';
  });

  const setGoogleTranslateCookie = (lang) => {
    const cookieValue = `/en/${lang}`;
    const domain = window.location.hostname;
    // Set cookie across root and domain scopes to ensure Google Translate reads it correctly
    document.cookie = `googtrans=${cookieValue}; path=/;`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=.${domain};`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${domain};`;
  };

  useEffect(() => {
    // Sync the cookie to current language choice on boot
    setGoogleTranslateCookie(language);
  }, [language]);

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
    setGoogleTranslateCookie(lang);

    // Try to trigger translate dynamically without page reload
    setTimeout(() => {
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = lang;
        select.dispatchEvent(new Event('change'));
      } else {
        // Fallback: Reload the page to let Google script pick up the fresh cookie on boot
        window.location.reload();
      }
    }, 150);
  };

  // Keep compatibility with current t() calls. Google Translate translates the actual DOM content dynamically.
  const t = (key, defaultText) => {
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
