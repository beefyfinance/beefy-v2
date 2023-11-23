import { memo } from 'react';
import type { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import type { BadgeComponentProps } from './types';
import clsx from 'clsx';

const useStyles = makeStyles((theme: Theme) => ({
  badge: {
    ...theme.typography['body-sm'],
    backgroundColor: theme.palette.background.v2.indicators.error,
    color: theme.palette.text.primary,
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

export const NotificationDot = memo<BadgeComponentProps>(function NewBadge({ className }) {
  const classes = useStyles();
  return <div className={clsx(classes.badge, className)} />;
});
