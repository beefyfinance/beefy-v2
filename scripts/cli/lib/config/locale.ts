import i18n, { TFunction } from 'i18next';

import { createFactory } from '../../utils/factory';

export const useTranslation = createFactory(async () => {
  const en = {
    main: await import('../../../../src/locales/en/main.json').then(module => module.default),
    risks: await import('../../../../src/locales/en/risks.json').then(module => module.default),
  };

  await i18n.init({
    resources: { en },
    cleanCode: true,
    fallbackLng: 'en',
    ns: Object.keys(en),
    defaultNS: 'main',
    partialBundledLanguages: false,
    supportedLngs: ['en'],
    interpolation: {
      escapeValue: false,
    },
  });

  return {
    t: i18n.t.bind(i18n) as TFunction,
    i18n,
  };
});
