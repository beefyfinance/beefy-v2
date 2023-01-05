import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'grid',
    rowGap: '16px',
    columnGap: '16px',
    gridTemplateColumns: 'repeat(6,minmax(0,1fr))',
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
    },
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
    },
  },
  chain: {
    display: 'flex',
    padding: '12px',
    columnGap: '8px',
    backgroundColor: theme.palette.background.dashboard.cardBg,
    borderRadius: '4px',
    alignItems: 'center',
  },
  chainLogo: {
    height: '32px',
  },
  chainText: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.disabled,
  },
  chainValue: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.secondary,
  },
});
