import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  vaults: {
    marginTop: '32px',
    borderRadius: '12px',
    border: `solid 2px ${theme.palette.background.contentDark}`,
    [theme.breakpoints.down('sm')]: {
      marginTop: '20px',
    },
  },
});
