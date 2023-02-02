import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  asset: {
    display: 'grid',
    padding: '16px 24px',
    backgroundColor: '#242842',
    gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
    [theme.breakpoints.down('md')]: {
      padding: '16px',
    },
  },
  assetFlex: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.primary,
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
  },
  value: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.secondary,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  subValue: {
    ...theme.typography['body-sm'],
    color: theme.palette.text.disabled,
    display: 'flex',
    justifyContent: 'flex-end',
  },
});
