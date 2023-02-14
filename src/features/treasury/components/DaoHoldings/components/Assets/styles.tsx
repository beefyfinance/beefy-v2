import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  assetsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    marginTop: '2px',
    rowGap: '2px',
    '& div:last-child': {
      borderRadius: '0px 0px 8px 8px',
    },
  },
  filter: {
    display: 'grid',
    padding: '16px 24px',
    gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
    backgroundColor: '#1B1E32',
    '& div': {
      ...theme.typography['subline-sm'],
      color: theme.palette.text.disabled,
      fontWeight: 700,
    },
    [theme.breakpoints.down('md')]: {
      padding: '16px',
    },
  },
  assetTypes: {
    backgroundColor: '#1B1E31',
    padding: '8px 16px',
    ...theme.typography['subline-sm'],
    color: theme.palette.text.disabled,
    fontWeight: 700,
  },
  sortColumn: {
    justifyContent: 'flex-start',
  },
});
