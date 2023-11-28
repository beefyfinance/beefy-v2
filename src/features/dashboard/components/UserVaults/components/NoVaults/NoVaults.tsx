import type { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '4px',
    padding: '24px',
    background: theme.palette.background.contentPrimary,
    borderRadius: '0px 0px 8px 8px',
    marginTop: '2px',
  },
  title: {
    ...theme.typography['h3'],
    color: theme.palette.text.middle,
  },
  text: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.middle,
  },
}));

export const NoVaults = memo(function NoVaults() {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <div className={classes.container}>
      <div className={classes.title}>{t('NoResults-NoResultsFound')}</div>
      <div className={classes.text}>{t('NoResults-TryClearSearch')}</div>
    </div>
  );
});
