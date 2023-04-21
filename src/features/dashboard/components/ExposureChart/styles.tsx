import type { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  container: {
    padding: '16px 24px',
    borderRadius: '8px',
    backgroundColor: theme.palette.background.v2.cardBg,
    [theme.breakpoints.down('md')]: {
      padding: '16px',
    },
    [theme.breakpoints.down('sm')]: {
      padding: '0px',
    },
  },
  infoContainer: {
    display: 'flex',
    columnGap: '24px',
    justifyContent: 'center',
    alignItems: 'center',
    '& .recharts-surface:focus': {
      outline: 'none',
    },
  },
  title: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.secondary,
    marginBottom: '24px',
  },
});
