import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  cowcentratedHeader: {
    display: 'grid',
    gap: '1px',
    gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
    [theme.breakpoints.down('xs')]: {
      gridTemplateColumns: '1fr',
    },
  },
  cowcentratedStat: {
    backgroundColor: theme.palette.background.contentPrimary,
    padding: '16px 24px',
  },
  label: {
    ...theme.typography['body-sm-med'],
    fontWeight: 700,
    color: theme.palette.text.dark,
    textTransform: 'uppercase' as const,
  },
  inRange: {
    color: theme.palette.primary.main,
  },
  outOfRange: {
    color: theme.palette.background.buttons.boost,
  },
  value: {
    ...theme.typography['body-lg-med'],
    fontWeight: 500,
    color: theme.palette.text.primary,
    '& span': {
      ...theme.typography['body-sm-med'],
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      color: theme.palette.text.dark,
    },
  },
  fullWidth: {
    widht: '100%',
    marginBottom: '1px',
  },
});
