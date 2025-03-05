import { legacyMakeStyles } from '../../../../../../../../helpers/mui.ts';
import type { ReactNode } from 'react';
import { memo } from 'react';
import { css } from '@repo/styles/css';

const useStyles = legacyMakeStyles({
  infoGrid: css.raw({
    display: 'grid',
    gridTemplateColumns: 'repeat(4,minmax(0, 1fr))',
    columnGap: '16px',
    mdDown: {
      gridTemplateColumns: 'minmax(0, 1fr)',
      rowGap: '4px',
    },
  }),
});

type InfoGridProps = {
  children: ReactNode;
};
export const InfoGrid = memo(function InfoGrid({ children }: InfoGridProps) {
  const classes = useStyles();
  return <div className={classes.infoGrid}>{children}</div>;
});
