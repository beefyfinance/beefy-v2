import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: '1 0 auto',
    gap: '16px',
  },
  inputs: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    flex: '1 0 auto',
  },
  footer: {
    marginTop: 'auto',
  },
});
