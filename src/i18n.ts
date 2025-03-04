import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enMain from './locales/en/main.json';
import enRisks from './locales/en/risks.json';

const en = {
  main: enMain,
  risks: enRisks,
};

// @dev if we ever add multiple languages again, make sure <App/> is wrapped in <Suspense/>
void i18n
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
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
    supportedLngs: ['en'],
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    react: {
      bindI18n: 'languageChanged hmr',
    },
  });

if (import.meta.hot) {
  // @dev allow HMR for locale files
  import.meta.hot.accept(
    ['./locales/en/main.json', './locales/en/risks.json'],
    ([newMain, newRisks]) => {
      if (newMain) {
        i18n.addResourceBundle('en', 'main', newMain.default, false, true);
      }
      if (newRisks) {
        i18n.addResourceBundle('en', 'risks', newRisks.default, false, true);
      }
      if (newMain || newRisks) {
        i18n.emit('hmr');
      }
    }
  );
}

// eslint-disable-next-line no-barrel-files/no-barrel-files -- needed for I18nextProvider
export { i18n };
