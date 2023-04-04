import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  inner: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '12px',
  },
});
