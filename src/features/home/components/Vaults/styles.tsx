import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  vaults: {
    marginTop: '20px',
    borderRadius: '12px',
    border: `solid 2px ${theme.palette.background.contentDark}`,
  },
});
