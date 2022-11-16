import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  holder: {
    background: '#2D3153',
    borderRadius: '8px',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  amountWithValue: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  amount: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.middle,
  },
  value: {
    ...theme.typography['body-sm'],
    color: theme.palette.text.dark,
  },
  tokenWithIcon: {
    display: 'flex',
    textAlign: 'right' as const,
    alignItems: 'center',
    gap: '8px',
  },
  token: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.middle,
  },
  icon: {
    width: '32px',
    height: '32px',
  },
});
