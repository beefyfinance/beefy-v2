import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  tableContainer: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    rowGap: '2px',
  },
  titleContainer: {
    backgroundColor: '#242842',
    display: 'flex',
    columnGap: '12px',
    alignItems: 'center',
    padding: '16px 24px',
    borderRadius: '8px 8px 0px 0px',
    [theme.breakpoints.down('md')]: {
      padding: '16px',
    },
  },
  title: {
    ...theme.typography.h3,
    color: theme.palette.text.primary,
  },
  value: {
    ...theme.typography.h3,
    color: theme.palette.text.disabled,
  },
  icon: {
    height: '32px',
    width: '32px',
  },
  sortColumns: {
    backgroundColor: theme.palette.background.dashboard.filter,
    padding: '16px 24px',
    display: 'grid',
    justifyItems: 'start',
    width: '100%',
    columnGap: '24px',
    marginBottom: '2px',
    gridTemplateColumns: 'repeat(5,minmax(0,1fr))',
    [theme.breakpoints.down('sm')]: {
      padding: '16px',
      gridTemplateColumns: 'repeat(5,minmax(0,auto))',
      width: 'calc(200px + 120px * 2 + 170px * 3)',
    },
  },
  columnHeader: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.disabled,
    [theme.breakpoints.down('md')]: {
      width: '200px',
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
