import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  balanceContainer: {
    display: 'flex',
    alignItems: 'center',
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.primary,
  },
  assetCount: {},
});
