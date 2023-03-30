import { makeStyles, Theme } from '@material-ui/core';
import React, { memo } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,minmax(0, 1fr))',
    columnGap: '16px',
    '& $stat': {
      textAlign: 'right',
    },
  },
}));

export const InfoGrid = memo(function ({ children }) {
  const classes = useStyles();
  return <div className={classes.infoGrid}>{children}</div>;
});
