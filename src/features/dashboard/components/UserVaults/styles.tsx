import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  tablesContainer: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    rowGap: '24px',
  },
});
