import { makeStyles, Theme } from '@material-ui/core';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: '16px',
  },
  loader: { height: '150px' },
  text: {
    ...theme.typography['subline-lg'],
    fontWeight: 700,
    color: theme.palette.text.disabled,
  },
}));

export const NoData = memo(function () {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <div className={classes.container}>
      <img
        className={classes.loader}
        src={require('../../../../../../images/empty-state.svg').default}
        alt="loader"
      />
      <div className={classes.text}>{t('pnl-graph-no-data')}</div>
    </div>
  );
});
