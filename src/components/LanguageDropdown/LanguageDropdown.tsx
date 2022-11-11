import { makeStyles, useMediaQuery } from '@material-ui/core';
import React, { memo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { localeToLanguageMap } from '../../i18n';
import { styles } from './styles';
import { LabeledSelect, LabeledSelectProps } from '../LabeledSelect';
import { ReactComponent as Globe } from '../../images/icons/navigation/globe.svg';
const useStyles = makeStyles(styles);

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

const SelectedLanguage = memo<LabeledSelectProps>(function SelectedLanguage({ value }) {
  const isMobile = useMediaQuery('(max-width: 960px)');
  const classes = useStyles();
  return (
    <div className={classes.flex}>
      <Globe />
      {isMobile && value.toUpperCase()}
    </div>
  );
});

export const LanguageDropdown = () => {
  const { i18n } = useTranslation();
  const i18nLanguage = getSelectedLanguage(i18n);
  const [language, setLanguage] = React.useState(i18nLanguage);
  const isMobile = useMediaQuery('(max-width: 960px)');

  const classes = useStyles();

  const handleSwitch = useCallback(newLanguage => i18n.changeLanguage(newLanguage), [i18n]);

  useEffect(() => {
    setLanguage(i18nLanguage);
  }, [setLanguage, i18nLanguage]);

  return (
    <LabeledSelect
      value={language}
      borderless={true}
      options={localeToLanguageMap}
      onChange={handleSwitch}
      SelectedItemComponent={SelectedLanguage}
      dropdownAutoWidth={false}
      selectClass={classes.select}
      placement={isMobile ? 'bottom-start' : 'bottom-end'}
      showArrow={isMobile ? true : false}
    />
  );
};
