import type { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,minmax(0, 1fr))',
    columnGap: '16px',
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: 'minmax(0, 1fr)',
      rowGap: '4px',
    },
  },
}));

export const InfoGrid = memo(function InfoGrid({ children }) {
  const classes = useStyles();
  return <div className={classes.infoGrid}>{children}</div>;
});
