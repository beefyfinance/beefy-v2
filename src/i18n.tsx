import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import enMain from './locales/en/main.json';
import enRisks from './locales/en/risks.json';

export const localeToLanguageMap = {
  //  ar: 'العربية',
  de: 'Deutsch',
  // el: 'Ελληνικά',
  en: 'English',
  // es: 'Español',
  // fil: 'Filipino',
  //  fr: 'Français',
  //  hi: 'हिन्दी',
  //  id: 'Bahasa Indonesia',
  //  it: 'Italiano',
  // ko: '한글',
  // ms: 'Bahasa Melayu',
  // nl: 'Nederlands',
  // 'pt-BR': 'Português do Brasil',
  // 'pt-PT': 'Português de Portugal',
  // ru: 'Pусский',
  // se: 'Svenska',
  // tr: 'Türkçe',
  // uk: 'Українська',
  zh: '中文',
} as const;

const en = {
  main: enMain,
  risks: enRisks,
};

type LocaleCode = keyof typeof localeToLanguageMap;
type Namespace = keyof typeof en;

function fetchLocale(
  language: LocaleCode,
  namespace: Namespace,
  callback: (errorValue: unknown, translations: null | typeof en[Namespace]) => void
) {
  import(`./locales/${language}/${namespace}.json`)
    .then(translations => {
      callback(null, translations);
    })
    .catch(error => {
      console.error(`failed to load ./locales/${language}/${namespace}.json`, error);
      callback(error, null);
    });
}

i18n
  // load translation using http -> see /public/locales
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // Load languages as needed
  .use({ type: 'backend', read: fetchLocale })
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    resources: {
      en,
    },
    cleanCode: true,
    fallbackLng: 'en',
    ns: Object.keys(en),
    defaultNS: 'main',
    partialBundledLanguages: true,
    supportedLngs: Object.keys(localeToLanguageMap),
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

// eslint-disable-next-line no-restricted-syntax
export default i18n;
