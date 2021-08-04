import { makeStyles, Typography } from '@material-ui/core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './styles';

const useStyles = makeStyles(styles);

const DisplayTags = ({ tags }) => {
  const classes = useStyles();
  const t = useTranslation().t;
  const getText = name => {
    switch (name) {
      case 'low':
        return t('VaultTag-LowRisk');
      case 'recent':
        return t('VaultTag-New');
      case 'depositsPaused':
        return t('VaultTag-Paused');
      case 'eol':
        return t('VaultTag-Inactv');
      default:
        return name;
    }
  };

  return tags.map(item => (
    <Typography
      className={[classes.tags, classes[item + 'Tag']].join(' ')}
      display={'inline'}
      key={item}
    >
      {getText(item)}
    </Typography>
  ));
};

export default DisplayTags;
