import { Theme } from '@material-ui/core/styles';

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
    background: theme.palette.background.content,
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
    backgroundColor: theme.palette.background.vaults.defaultOutline,
    '&:Hover': {
      backgroundColor: '#272B4A',
    },
    '&:disabled': {
      borderColor: 'transparent' as const,
    },
  },
});
