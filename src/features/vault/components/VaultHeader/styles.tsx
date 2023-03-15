import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  header: {
    display: 'flex',
    [theme.breakpoints.down('md')]: {
      display: 'block',
    },
  },
  titleHolder: {
    display: 'flex',
    marginBottom: '8px',
    alignItems: 'center',
    flexGrow: 1,
    [theme.breakpoints.up('lg')]: {
      marginBottom: '0',
    },
  },
  title: {
    ...theme.typography['h1'],
    color: theme.palette.text.secondary,
    margin: '0 0 0 12px',
  },
  labelsHolder: {
    display: 'flex',
    rowGap: '24px',
    columnGap: '24px',
    alignItems: 'center',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-start',
    },
  },
  platformLabel: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.disabled,
    '& span': {
      color: theme.palette.text.primary,
      textTransform: 'uppercase' as const,
    },
  },
  shareHolder: {
    marginLeft: 'auto',
  },
});
