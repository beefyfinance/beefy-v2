import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '2px',
    '& div:last-child': {
      borderRadius: '0px 0px 8px 8px',
    },
  },
  title: {
    ...theme.typography.h3,
    padding: '16px 24px',
    display: 'flex',
    columnGap: '12px',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#242842',
    borderRadius: '8px 8px 0px 0px',
    '& img': {
      height: '32px',
    },
    [theme.breakpoints.down('md')]: {
      padding: '16px',
    },
  },
  nameContainer: {
    display: 'flex',
    columnGap: '12px',
    alignItems: 'center',
  },
  chainName: { color: theme.palette.text.primary },
  usdValue: { color: theme.palette.text.disabled },
});
