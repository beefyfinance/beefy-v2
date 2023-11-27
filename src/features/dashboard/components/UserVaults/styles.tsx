import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    '& div:last-child': {
      '& .vault': {
        borderRadius: '0px 0px 8px 8px',
        borderBottom: 0,
      },
    },
  },
  vaultsContainer: {
    borderRadius: '12px',
    border: `solid 2px ${theme.palette.background.contentDark}`,
  },
});
