import type { ReactNode } from 'react';
import { memo } from 'react';
import type { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  value: {
    ...theme.typography['body-sm-med'],
    color: theme.palette.text.middle,
    textAlign: 'right' as const,
  },
}));

export type ValueProps = {
  children: ReactNode;
};

export const Value = memo<ValueProps>(function Value({ children }) {
  const classes = useStyles();
  return <div className={classes.value}>{children}</div>;
});
