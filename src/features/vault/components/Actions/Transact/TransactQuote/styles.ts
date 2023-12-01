import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {},
  divider: {
    marginBottom: '16px',
  },
  tokenAmounts: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    width: '100%',
  },
  route: {
    marginTop: '24px',
  },
  slippage: {
    marginTop: '24px',
  },
  returned: {
    marginTop: '16px',
  },
  returnedTitle: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.dark,
    marginBottom: '8px',
  },
});
