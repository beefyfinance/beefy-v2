import type { ReactNode } from 'react';
import { memo } from 'react';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { css } from '@repo/styles/css';

const useStyles = legacyMakeStyles({
  value: css.raw({
    textStyle: 'body.sm.medium',
    color: 'text.middle',
    textAlign: 'right',
  }),
});

export type ValueProps = {
  children: ReactNode;
};

export const Value = memo(function Value({ children }: ValueProps) {
  const classes = useStyles();
  return <div className={classes.value}>{children}</div>;
});
