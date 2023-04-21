import type { ReactNode } from 'react';
import { memo } from 'react';
import type { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  label: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.dark,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
}));

export type LabelProps = { children: ReactNode };

export const Label = memo<LabelProps>(function Label({ children }) {
  const classes = useStyles();
  return <div className={classes.label}>{children}</div>;
});
