import { Theme } from '@material-ui/core';

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
    color: theme.palette.text.disabled,
    textAlign: 'left' as const,
    [theme.breakpoints.up('md')]: {
      textAlign: 'center' as const,
    },
  },
  price: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.disabled,
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
    marginLeft: theme.spacing(0.5),
  },
  noTextContentLoader: {
    paddingTop: '3px',
  },
});
