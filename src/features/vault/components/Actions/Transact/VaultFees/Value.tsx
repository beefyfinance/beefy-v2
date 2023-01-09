import { memo, PropsWithChildren } from 'react';
import { makeStyles } from '@material-ui/core';
import { Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  value: {
    ...theme.typography['body-sm-med'],
    color: theme.palette.text.middle,
    textAlign: 'right' as const,
  },
}));

export type ValueProps = PropsWithChildren<{}>;

export const Value = memo<ValueProps>(function Value({ children }) {
  const classes = useStyles();
  return <div className={classes.value}>{children}</div>;
});
