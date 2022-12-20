import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '2px',
    marginBottom: '16px',
    '& div:last-child': {
      borderRadius: '0px 0px 8px 8px',
    },
  },
  title: {
    ...theme.typography.h3,
    padding: '16px 24px',
    display: 'flex',
    columnGap: '12px',
    alignItems: 'center',
    backgroundColor: '#242842',
    borderRadius: '8px 8px 0px 0px',
    '& img': {
      height: '32px',
    },
    '& div': {
      color: theme.palette.text.primary,
    },
    '& span': {
      color: theme.palette.text.disabled,
    },
    [theme.breakpoints.down('md')]: {
      padding: '16px',
    },
  },
});
