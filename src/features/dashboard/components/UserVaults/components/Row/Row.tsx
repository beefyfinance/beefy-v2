import type { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import type { PropsWithChildren } from 'react';
import React, { memo } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  rowContainer: {
    display: 'grid',
    backgroundColor: theme.palette.background.v2.cardBg,
    padding: '16px',
    gridTemplateColumns: 'minmax(0, 30fr) minmax(0, 70fr)',
    columnGap: '16px',
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: 'repeat(2,minmax(0, 50fr))',
    },
  },
  rowMobileContainer: {
    padding: '16px',
    backgroundColor: theme.palette.background.appBG,
  },
}));

type RowGapProps = PropsWithChildren<{
  className?: string;
}>;

export const Row = memo<RowGapProps>(function Row({ children, className }) {
  const classes = useStyles();
  return <div className={clsx(classes.rowContainer, className)}>{children}</div>;
});

export const RowMobile = memo<RowGapProps>(function RowMobile({ children, className }) {
  const classes = useStyles();
  return <div className={clsx(classes.rowMobileContainer, className)}>{children}</div>;
});
