import { Theme } from '@material-ui/core/styles';

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
    [theme.breakpoints.up('lg')]: {
      textAlign: 'right' as const,
    },
  },
});
