import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import de from './locales/de.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import es from './locales/es.json';

const resources = {
  de: { translation: de },
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'de', // default language
    fallbackLng: 'de',
    interpolation: {
      escapeValue: false // React already does escaping
    },
    debug: false
  });

export default i18n;
