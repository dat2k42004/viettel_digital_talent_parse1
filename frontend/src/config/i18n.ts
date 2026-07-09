import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import viTranslation from '../assets/locales/vi.json';
import enTranslation from '../assets/locales/en.json';

const savedLanguage = localStorage.getItem('language') || 'vi';

export const resources = {
  vi: {
    translation: viTranslation,
  },
  en: {
    translation: enTranslation,
  },
} as const;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false, // React already prevents XSS
    },
  });

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: typeof resources['vi'];
  }
}

export default i18n;
