import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import translationAR from './locales/ar/translation.json';
import translationCN from './locales/cn/translation.json';
import translationDE from './locales/de/translation.json';
import translationEL from './locales/el/translation.json';
import translationEN from './locales/en/translation.json';
import translationES from './locales/es/translation.json';
import translationFIL from './locales/fil/translation.json';
import translationFR from './locales/fr/translation.json';
import translationHI from './locales/hi/translation.json';
import translationID from './locales/id/translation.json';
import translationIT from './locales/it/translation.json';
import translationKO from './locales/ko/translation.json';
import translationMS from './locales/ms/translation.json';
import translationNL from './locales/nl/translation.json';
import translationPT_br from './locales/pt-BR/translation.json';
import translationPT_pt from './locales/pt-PT/translation.json';
import translationRU from './locales/ru/translation.json';
import translationSE from './locales/se/translation.json';
import translationTR from './locales/tr/translation.json';
import translationUK from './locales/uk/translation.json';
import translationZH from './locales/zh/translation.json';

const resources = {
  ar: { translation: translationAR },
  cn: { translation: translationCN },
  de: { translation: translationDE },
  el: { translation: translationEL },
  en: { translation: translationEN },
  es: { translation: translationES },
  fil: { translation: translationFIL },
  fr: { translation: translationFR },
  hi: { translation: translationHI },
  id: { translation: translationID },
  it: { translation: translationIT },
  ko: { translation: translationKO },
  ms: { translation: translationMS },
  nl: { translation: translationNL },
  'pt-BR': { translation: translationPT_br },
  'pt-PT': { translation: translationPT_pt },
  ru: { translation: translationRU },
  se: { translation: translationSE },
  tr: { translation: translationTR },
  uk: { translation: translationUK },
  zh: { translation: translationZH },
  // TODO: more translations
};

i18n
  // load translation using http -> see /public/locales
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    resources,
    fallbackLng: 'en',

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n;
