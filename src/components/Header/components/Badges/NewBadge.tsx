import { memo } from 'react';
import { makeStyles, Theme } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { BadgeComponentProps } from './types';

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

export const NewBadge = memo<BadgeComponentProps>(function NewBadge() {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <>
      <div className={classes.spacer} />
      <div className={classes.badge}>{t('Header-Badge-New')}</div>
    </>
  );
});
