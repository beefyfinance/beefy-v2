import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    rowGap: '2px',
    marginTop: '2px',
  },
});
