import { memo } from 'react';
import { makeStyles, Theme } from '@material-ui/core';
import { BadgeComponentProps } from './types';

const useStyles = makeStyles((theme: Theme) => ({
  badge: {
    ...theme.typography['body-sm'],
    backgroundColor: '#D15347',
    color: '#fff',
    padding: '0',
    borderRadius: '100%',
    height: '8px',
    width: '8px',
    position: 'absolute' as const,
    top: '4px',
    right: '0',
    transform: 'translate(50%, -50%)',
    pointerEvents: 'none',
  },
}));

export const NotificationDot = memo<BadgeComponentProps>(function NewBadge() {
  const classes = useStyles();
  return <div className={classes.badge} />;
});
