import React, { memo, useMemo } from 'react';
import { makeStyles, Typography, Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';

const useStyles = makeStyles(styles as any);
const _DisplayTags = ({ tags, isBoosted, isMoonpot }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const labels = useMemo(
    () => ({
      low: t('VaultTag-LowRisk'),
      'deposits-paused': t('VaultTag-Paused'),
      eol: t('VaultTag-Inactive'),
      bluechip: t('VaultTag-Bluechip'),
    }),
    [t]
  );

  return (
    <>
      {isBoosted && (
        <div className={classes.spacingMobile} key={'boost'}>
          <Typography className={classes.tags}>{t('VaultTag-Boost')}</Typography>
        </div>
      )}
      {isMoonpot && (
        <div className={classes.spacingMobile} key={'pots'}>
          <Box className={classes.tags}>
            <img src={require('../../images/pots.svg').default} alt="pots" />{' '}
            <Typography className={classes.text}>{t('VaultTag-Moonpot')}</Typography>
          </Box>
        </div>
      )}
      {tags.map(item => (
        <div className={classes.spacingMobile} key={item}>
          <Typography className={classes.tags}>{item in labels ? labels[item] : item}</Typography>
        </div>
      ))}
    </>
  );
};

export const DisplayTags = memo(_DisplayTags);
