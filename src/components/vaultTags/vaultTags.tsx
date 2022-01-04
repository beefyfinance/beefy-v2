import React, { memo, useMemo } from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';

const useStyles = makeStyles(styles as any);
const _DisplayTags = ({ tags, isBoosted }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const labels = useMemo(
    () => ({
      low: t('VaultTag-LowRisk'),
      'deposits-paused': t('VaultTag-Paused'),
      eol: t('VaultTag-Inactive'),
      bluechip: t('VaultTag-Bluechip'),
      boost: t('VaultTag-Boost'),
    }),
    [t]
  );

  return (
    <>
      {tags.map(item => (
        <div className={classes.spacingMobile} key={item}>
          <Typography className={classes.tags} display={'inline'}>
            {item in labels ? labels[item] : item}
          </Typography>
        </div>
      ))}
      {isBoosted && (
        <div className={classes.spacingMobile} key={'boost'}>
          <Typography className={classes.tags} display={'inline'}>
            {t('VaultTag-Boost')}
          </Typography>
        </div>
      )}
    </>
  );
};

export const DisplayTags = memo(_DisplayTags);
