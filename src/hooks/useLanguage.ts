import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export type Language = 'en' | 'it';

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const language = i18n.language as Language;

  const changeLanguage = useCallback((newLanguage: Language) => {
    i18n.changeLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  }, [i18n]);

  const toggleLanguage = useCallback(() => {
    const newLanguage = language === 'en' ? 'it' : 'en';
    changeLanguage(newLanguage);
  }, [language, changeLanguage]);

  return {
    language,
    changeLanguage,
    toggleLanguage,
  };
};

