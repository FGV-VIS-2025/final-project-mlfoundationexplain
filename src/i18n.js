// src/i18n.js
import { register, init, getLocaleFromNavigator, locale } from 'svelte-i18n';

// Registra os idiomas disponíveis
register('en', () => import('./locales/en.json'));
register('pt', () => import('./locales/pt.json'));
register('es', () => import('./locales/es.json')); // Peruano (regional)

// Lista dos idiomas suportados
const supportedLocales = ['en', 'pt', 'es'];

// Detecta idioma inicial
function getInitialLocale() {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && supportedLocales.includes(urlLang)) {
      return urlLang;
    }

    const storedLocale = localStorage.getItem('locale');
    if (storedLocale && supportedLocales.includes(storedLocale)) {
      return storedLocale;
    }

    const navigatorLocale = getLocaleFromNavigator();
    if (navigatorLocale) {
      const langCode = navigatorLocale.substring(0, 2);
      if (supportedLocales.includes(langCode)) {
        return langCode;
      }
    }
  }
  // Fallback padrão
  return 'pt';
}

// Inicializa i18n com o idioma inicial detectado
export const initI18n = () => {
  const initialLocale = getInitialLocale();

  return init({
    fallbackLocale: 'pt',
    initialLocale,
  });
};

// Função para mudar idioma e persistir localmente
export const changeLocale = (newLocale) => {
  if (supportedLocales.includes(newLocale)) {
    locale.set(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
    }
  }
};
