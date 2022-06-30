import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  holder: {
    ...theme.typography['subline-sm'],
    color: '#D0D0DA',
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '16px',
    columnGap: '8px',
    justifyContent: 'center',
    [theme.breakpoints.up('sm')]: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
    [theme.breakpoints.up('lg')]: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
  },
  item: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    width: '24px',
    height: '24px',
    marginLeft: '8px',
    marginRight: '4px',
  },
  key: {
    width: '4px',
    height: '24px',
    borderRadius: '2px',
  },
});
