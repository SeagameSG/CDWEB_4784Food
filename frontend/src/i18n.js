import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import translationVI from './locales/vi/translation.json';
import translationEN from './locales/en/translation.json';

const resources = {
  vi: {
    translation: translationVI
  },
  en: {
    translation: translationEN
  }
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'vi', // Default language
    debug: true, // Set to false in production
    interpolation: {
      escapeValue: false, // React already escapes values
    }
  });

export default i18n;