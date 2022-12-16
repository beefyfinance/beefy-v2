import { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    marginLeft: '-16px',
    paddingBottom: '48px',
    '& div:last-child': {
      marginBottom: '0',
    },
  },
  columnClassName: {
    paddingLeft: '16px',
  },
});
