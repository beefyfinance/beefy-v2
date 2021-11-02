import React, { memo, useMemo } from 'react';
import { makeStyles, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import clsx from 'clsx';

const useStyles = makeStyles(styles as any);
const _DisplayTags = ({ tags }) => {
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

  return tags.map(item => (
    <div className={classes.spacingMobile} key={item}>
      <Typography className={clsx(classes.tags, classes[item + 'Tag'])} display={'inline'}>
        {item in labels ? labels[item] : item}
      </Typography>
    </div>
  ));
};

export const DisplayTags = memo(_DisplayTags);
