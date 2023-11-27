import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  title: {
    marginBottom: '12px',
    display: 'flex',
  },
  expiredBoostName: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.light,
    marginLeft: '8px',
  },
  expiredBoostContainer: {
    background: theme.palette.background.contentLight,
    borderRadius: '8px',
    padding: '12px',
  },
  balances: {
    display: 'flex',
    columnGap: '8px',
    marginBottom: '12px',
  },
  balance: {
    ...theme.typography['body-sm'],
    color: theme.palette.text.dark,
    '& span': {
      color: theme.palette.text.middle,
    },
  },
  button: {
    '&:disabled': {
      borderColor: 'transparent' as const,
    },
  },
});
