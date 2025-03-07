import type { ReactNode } from 'react';
import { memo } from 'react';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { css } from '@repo/styles/css';

const useStyles = legacyMakeStyles({
  label: css.raw({
    textStyle: 'subline.sm',
    fontWeight: 'bold',
    color: 'text.dark',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  }),
});

export type LabelProps = {
  children: ReactNode;
};

export const Label = memo(function Label({ children }: LabelProps) {
  const classes = useStyles();
  return <div className={classes.label}>{children}</div>;
});
