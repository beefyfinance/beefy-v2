import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  value: {
    ...theme.typography['body-lg-med'],
    margin: 0,
    padding: 0,
    whiteSpace: 'nowrap' as const,
    [theme.breakpoints.down('md')]: {
      textAlign: 'left' as const,
    },
  },
  label: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.dark,
    textAlign: 'left' as const,
    [theme.breakpoints.up('md')]: {
      textAlign: 'center' as const,
    },
  },
  price: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.dark,
    whiteSpace: 'nowrap' as const,
  },
  blurred: {
    filter: 'blur(.5rem)',
  },
  tooltipLabel: {
    display: 'flex',
    alignItems: 'center',
  },
  tooltipHolder: {
    marginLeft: '4px',
  },
  tooltipIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.text.dark,
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  noTextContentLoader: {
    paddingTop: '3px',
  },
});
