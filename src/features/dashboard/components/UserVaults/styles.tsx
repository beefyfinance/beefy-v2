import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    rowGap: '2px',
    marginTop: '2px',
    '& div:last-child': {
      '& .lastBorderRadius': {
        borderRadius: '0px 0px 8px 8px',
      },
    },
  },
});
