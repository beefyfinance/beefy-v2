import { memo } from 'react';
import type { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import type { BadgeComponentProps } from './types';
import clsx from 'clsx';

const useStyles = makeStyles((theme: Theme) => ({
  badge: {
    ...theme.typography['body-sm'],
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.background.header,
    padding: '0px 6px',
    borderRadius: '10px',
    height: '20px',
    position: 'absolute' as const,
    top: '-2px',
    right: '0',
    transform: 'translate(50%, -50%)',
    pointerEvents: 'none',
  },
  spacer: {
    width: '12px',
    pointerEvents: 'none',
  },
}));

export const NewBadge = memo<BadgeComponentProps>(function NewBadge({ className }) {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <>
      <div className={classes.spacer} />
      <div className={clsx(classes.badge, className)}>{t('Header-Badge-New')}</div>
    </>
  );
});
