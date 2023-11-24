import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    '& div:last-child': {
      '& .lastBorderRadius': {
        borderRadius: '0px 0px 8px 8px',
      },
    },
  },
  vaultsContainer: {
    borderRadius: '12px',
    border: `solid 2px ${theme.palette.background.v2.contentDark}`,
  },
});
