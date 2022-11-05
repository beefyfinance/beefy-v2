import { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  vaultsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '2px',
    '& div:last-child': {
      borderRadius: '0px 0px 8px 8px',
    },
  },
  vault: {
    display: 'grid',
    columnGap: '24px',
    rowGap: '24px',
    padding: '16px 24px',
    backgroundColor: theme.palette.background.dashboard.cardBg,
    gridTemplateColumns: 'repeat(5,minmax(0,1fr))',
    [theme.breakpoints.down('sm')]: {
      padding: '16px',
      gridTemplateColumns: 'repeat(5,minmax(0,auto))',
      width: 'calc(200px + 120px*2 + 170px * 3)',
    },
  },
  vaultName: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.primary,
    display: 'flex',
    columnGap: '8px',
    [theme.breakpoints.down('sm')]: {
      width: '200px',
      '& div': {
        width: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
    },
  },
  itemSmall: {
    justifyContent: 'flex-start',
    [theme.breakpoints.down('md')]: {
      width: '120px',
    },
  },
  itemBig: {
    justifyContent: 'flex-start',
    [theme.breakpoints.down('md')]: {
      width: '170px',
    },
  },
});
