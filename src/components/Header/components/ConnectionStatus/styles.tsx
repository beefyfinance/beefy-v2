import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    backgroundColor: '#242737',
    alignItems: 'center',
    borderRadius: '8px',
  },
  walletContainer: {
    [theme.breakpoints.down('xs')]: {
      paddingLeft: '16px',
    },
  },
  statusContainer: {
    paddingRight: '16px',
    display: 'flex',
    columnGap: '8px',
    alignItems: 'center',
  },
  line: {
    height: '16px',
    width: '2px',
    borderRadius: '3px',
    backgroundColor: '#30354F',
  },
  chain: {
    display: 'flex',
    alignItems: 'center',
    '& img': {
      height: '24px',
    },
  },
});
