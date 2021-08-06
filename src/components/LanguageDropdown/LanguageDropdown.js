import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { localeToLanguageMap } from 'i18n';
import CustomDropdown from '../customDropdown';

const getSelectedLanguage = i18n => {
  const cachedLanguage = i18n.language;

  if (!cachedLanguage) {
    return 'en';
  }

  if (cachedLanguage in localeToLanguageMap) {
    return cachedLanguage;
  }

  const languageCode = cachedLanguage.split('-')[0].toLowerCase();
  if (languageCode in localeToLanguageMap) {
    return languageCode;
  }

  return 'en';
};

const selectedRenderer = locale => {
  return locale.toUpperCase();
};

const LanguageDropdown = props => {
  const { i18n } = useTranslation();
  const i18nLanguage = getSelectedLanguage(i18n);
  const [language, setLanguage] = React.useState(i18nLanguage);

  const handleSwitch = useCallback(
    event => {
      if (!event?.target?.value) return;
      const newLanguage = event.target.value;
      return i18n.changeLanguage(newLanguage);
    },
    [i18n]
  );

  useEffect(() => {
    setLanguage(i18nLanguage);
  }, [setLanguage, i18nLanguage]);

  return (
    <CustomDropdown
      list={localeToLanguageMap}
      selected={language}
      handler={handleSwitch}
      renderValue={selectedRenderer}
      {...props}
    />
  );
};

export default LanguageDropdown;
