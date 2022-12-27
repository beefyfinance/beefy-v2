import { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  container: {
    width: '100%',
    padding: '16px 24px',
    backgroundColor: theme.palette.background.dashboard.cardBg,
    borderRadius: '8px',
    display: 'grid',
    rowGap: '16px',
    [theme.breakpoints.only('md')]: {
      height: '120px',
    },
    [theme.breakpoints.down('md')]: {
      padding: '16px',
    },
  },
  title: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.primary,
  },
  bar: {
    height: '12px',
    width: '100%',
    borderRadius: '80px',
    display: 'flex',
    '& $barItem:first-child': {
      borderRadius: '80px 0px 0px 80px',
    },
    '& $barItem:last-child': {
      borderRadius: '0px 80px 80px 0px',
      borderRight: 'none',
    },
  },
  barItem: {
    height: '100%',
    borderRight: `2px solid ${theme.palette.background.dashboard.cardBg}`,
  },
  legendContainer: {
    display: 'flex',
    columnGap: '32px',
    [theme.breakpoints.down('md')]: {
      flexWrap: 'wrap',
      columnGap: '16px',
      rowGap: '8px',
    },
  },
  legendItem: {
    display: 'flex',
    columnGap: '8px',
    alignItems: 'center',
  },
  square: {
    height: '12px',
    width: '12px',
    borderRadius: '2px',
  },
  label: {
    ...theme.typography['body-sm-med'],
    color: '#D0D0DA',
    textTransform: 'capitalize' as const,
    '& span': {
      ...theme.typography['body-sm'],
      color: '#999CB3',
      marginLeft: '4px',
    },
  },
  uppercase: {
    textTransform: 'uppercase' as const,
  },
});
