import { makeStyles } from '@material-ui/core';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { localeToLanguageMap } from '../../i18n';
import { SimpleDropdown } from '../SimpleDropdown';
import { styles } from './styles';
const useStyles = makeStyles(styles as any);

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

export const LanguageDropdown = ({ isWalletConnected }: { isWalletConnected?: boolean }) => {
  const { i18n } = useTranslation();
  const i18nLanguage = getSelectedLanguage(i18n);
  const [language, setLanguage] = React.useState(i18nLanguage);

  const classes = useStyles();

  const handleSwitch = useCallback(newLanguage => i18n.changeLanguage(newLanguage), [i18n]);

  useEffect(() => {
    setLanguage(i18nLanguage);
  }, [setLanguage, i18nLanguage]);

  return (
    <SimpleDropdown
      className={classes.lenguageCustom}
      noBorder={true}
      list={localeToLanguageMap}
      selected={language}
      handler={handleSwitch}
      renderValue={selectedRenderer}
    />
  );
};
