import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
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
    backgroundColor: 'rgba(92, 112, 214, 0.4)',
    padding: '16px 24px',
    ...theme.typography['subline-sm'],
    color: '#ADB8EB',
    fontWeight: 700,
    [theme.breakpoints.down('md')]: {
      padding: '16px',
    },
  },
  sortColumn: {
    justifyContent: 'flex-start',
  },
});
