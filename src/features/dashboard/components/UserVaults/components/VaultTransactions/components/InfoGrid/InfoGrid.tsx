import type { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import type { ReactNode } from 'react';
import { memo } from 'react';

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

type InfoGridProps = {
  children: ReactNode;
};
export const InfoGrid = memo<InfoGridProps>(function InfoGrid({ children }) {
  const classes = useStyles();
  return <div className={classes.infoGrid}>{children}</div>;
});
