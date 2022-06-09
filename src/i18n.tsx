import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

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
};

const o_risksNstrats = code => {
  try {
    return require(`./locales/${code}/risksNstrats.json`);
  } catch {
    return null;
  }
};
const resources = Object.fromEntries(
  Object.keys(localeToLanguageMap).map(code => [
    code,
    {
      translation: {
        ...require(`./locales/${code}/main.json`),
        ...o_risksNstrats(code),
      },
    },
  ])
);

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

// eslint-disable-next-line no-restricted-syntax
export default i18n;
