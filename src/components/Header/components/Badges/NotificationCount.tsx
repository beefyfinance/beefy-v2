import { memo } from 'react';
import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  badge: {
    ...theme.typography['body-sm'],
    backgroundColor: '#D15347',
    color: '#fff',
    pointerEvents: 'none',
    marginLeft: '6px',
    borderRadius: '100%',
    width: '20px',
    height: '20px',
    textAlign: 'center' as const,
  },
}));

type NotificationCountProps = {
  count: number;
};

export const NotificationCount = memo<NotificationCountProps>(function NotificationCount({
  count,
}) {
  const classes = useStyles();
  return <div className={classes.badge}>{count}</div>;
});
