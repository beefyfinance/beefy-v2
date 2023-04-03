import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'none',
    [theme.breakpoints.only('md')]: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      columnGap: '32px',
    },
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
    ...theme.typography['body-sm'],
    color: theme.palette.text.disabled,
    '& span': {
      color: theme.palette.text.secondary,
    },
  },
  boostText: {
    '& span': {
      color: '#DB8332',
    },
  },
});
