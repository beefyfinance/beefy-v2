import type { Theme } from '@material-ui/core';

export const styles = (_theme: Theme) => ({
  container: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  description: {},
});
