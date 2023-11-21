import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {},
  title: {
    ...theme.typography['h1'],
    fontSize: '45px',
    lineHeight: '56px',
    color: theme.palette.text.primary,
  },
  text: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.secondary,
    marginTop: '32px',
    '& p': {
      marginTop: 0,
      marginBottom: '1em',
      '&:last-child': {
        marginBottom: 0,
      },
    },
  },
  poweredBy: {
    marginTop: '64px',
  },
  poweredByLabel: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.disabled,
    marginTop: '32px',
  },
  poweredByLogos: {
    marginTop: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  },
});
