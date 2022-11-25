import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  bifiPrice: {
    ...theme.typography['body-lg-med'],
    display: 'flex',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    color: theme.palette.text.disabled,
    whiteSpace: 'nowrap' as const,
    textDecoration: 'none',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-start',
    },
    '& img': {
      height: '24px',
      marginRight: '5px',
    },
  },
});
