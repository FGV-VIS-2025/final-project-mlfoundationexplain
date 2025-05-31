// src/i18n.js
import { register, init, getLocaleFromNavigator, locale } from 'svelte-i18n';

// Register locales with proper error handling
register('en', () => import('./locales/en.json'));
register('pt', () => import('./locales/pt.json'));

// Function to detect locale from URL or navigator
function getInitialLocale() {
  // Check if running in browser
  if (typeof window !== 'undefined') {
    // Check URL parameters first (useful for GitHub Pages)
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && ['en', 'pt'].includes(urlLang)) {
      return urlLang;
    }
    
    // Check localStorage for persisted locale
    const storedLocale = localStorage.getItem('locale');
    if (storedLocale && ['en', 'pt'].includes(storedLocale)) {
      return storedLocale;
    }
    
    // Fall back to browser locale
    const navigatorLocale = getLocaleFromNavigator();
    if (navigatorLocale) {
      // Extract language code (e.g., 'pt-BR' -> 'pt')
      const langCode = navigatorLocale.substring(0, 2);
      if (['en', 'pt'].includes(langCode)) {
        return langCode;
      }
    }
  }
  
  // Default fallback
  return 'pt';
}

export const initI18n = () => {
  const initialLocale = getInitialLocale();
  
  return init({
    fallbackLocale: 'pt',
    initialLocale,
  });
};

// Function to change locale and persist it
export const changeLocale = (newLocale) => {
  if (['en', 'pt'].includes(newLocale)) {
    locale.set(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
    }
  }
};