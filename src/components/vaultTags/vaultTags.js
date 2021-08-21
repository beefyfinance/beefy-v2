import { makeStyles, Typography, Box } from '@material-ui/core';
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
      case 'deposits-paused':
        return t('VaultTag-Paused');
      case 'eol':
        return t('VaultTag-Inactive');
      case 'bluechip':
        return t('VaultTag-Bluechip');
      default:
        return name;
    }
  };

  return tags.map(item => (
    <Box className={classes.spacingMobile} key={item}>
      <Typography className={[classes.tags, classes[item + 'Tag']].join(' ')} display={'inline'}>
        {getText(item)}
      </Typography>
    </Box>
  ));
};

export default DisplayTags;
