import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  title: {
    marginBottom: '12px',
    display: 'flex',
  },
  expiredBoostName: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.primary,
    marginLeft: '8px',
  },
  expiredBoostContainer: {
    background: theme.palette.background.v2.contentLight,
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
    color: theme.palette.text.disabled,
    '& span': {
      color: theme.palette.text.secondary,
    },
  },
  button: {
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.vaults.boost,
    '&:Hover': {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.vaults.boost,
    },
    '&:disabled': {
      borderColor: 'transparent' as const,
    },
  },
});
