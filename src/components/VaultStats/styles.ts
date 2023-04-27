import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  vaultStats: {
    display: 'flex',
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: 'column' as const,
    justifyContent: 'center' as const,
  },
  row: {
    display: 'grid',
    width: '100%',
    columnGap: '24px',
    rowGap: '24px',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    [theme.breakpoints.up('sm')]: {
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    },
    [theme.breakpoints.up('md')]: {
      gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    },
  },
  column: {
    width: '100%',
    [theme.breakpoints.up('lg')]: {
      textAlign: 'right' as const,
    },
  },
  flexEnd: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '4px',
    justifyContent: 'flex-end',
    width: '100%',
  },
  columnFlex: {
    display: 'flex',
    justifyContent: 'flex-end',
    columnGap: '4px',
    [theme.breakpoints.up('lg')]: {
      textAlign: 'right' as const,
    },
  },
  hideMd: {
    display: 'none',
    [theme.breakpoints.up('lg')]: {
      display: 'block',
    },
  },
  hideSm: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'block',
    },
  },
  textGreen: {
    color: theme.palette.primary.main,
  },
  rowDashboard: {
    display: 'grid',
    width: '100%',
    gridTemplateColumns: 'minmax(0, 1fr)',
    columnGap: '8px',
    '& $column': {
      marginLeft: 'auto',
      textAlign: 'right' as const,
    },
    [theme.breakpoints.up('md')]: {
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    },
    [theme.breakpoints.up('lg')]: {
      gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    },
  },
  textOverflow: {
    marginLeft: 'auto',
    overflow: 'hidden',
    whiteSpace: 'nowrap' as const,
    textOverflow: 'ellipsis',
  },
  maxWidth80: {
    maxWidth: '80%',
  },
  maxWidth60: {
    maxWidth: '80%',
  },
  displayBlock: {
    display: 'block',
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
});
