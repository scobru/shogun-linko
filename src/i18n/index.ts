import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import it from './locales/it.json';

// Get saved language from localStorage or default to Italian
const savedLanguage = localStorage.getItem('language') || 'it';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en
      },
      it: {
        translation: it
      }
    },
    lng: savedLanguage,
    fallbackLng: 'it',
    interpolation: {
      escapeValue: false // React already does escaping
    }
  });

export default i18n;

