import { memo, PropsWithChildren } from 'react';
import { makeStyles } from '@material-ui/core';
import { Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  label: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.dark,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
}));

export type LabelProps = PropsWithChildren<{}>;

export const Label = memo<LabelProps>(function Label({ children }) {
  const classes = useStyles();
  return <div className={classes.label}>{children}</div>;
});
