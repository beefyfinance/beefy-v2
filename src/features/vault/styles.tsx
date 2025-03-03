import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  page: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
    paddingTop: '32px',
    paddingBottom: '32px',
    [theme.breakpoints.down('sm')]: {
      padding: '32px 12px',
      gap: '16px',
    },
  },
  contentContainer: {},
  contentColumns: {
    display: 'grid',
    gridTemplateColumns: '100%',
    gap: '24px',
    [theme.breakpoints.up('md')]: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,666fr) minmax(0,333fr)',
    },
    [theme.breakpoints.down('sm')]: {
      gap: '12px',
    },
  },
  columnActions: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '24px',
    '& > :first-child': {
      marginTop: 0,
    },
    [theme.breakpoints.up('md')]: {
      order: 1,
    },
    [theme.breakpoints.down('sm')]: {
      gap: '12px',
    },
  },
  columnInfo: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '24px',
    [theme.breakpoints.up('md')]: {
      marginTop: 0,
    },
    [theme.breakpoints.down('sm')]: {
      gap: '12px',
    },
  },
});
