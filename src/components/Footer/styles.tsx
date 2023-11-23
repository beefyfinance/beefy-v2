import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: theme.palette.background.v2.appBg,
  },
  wrapperTop: {
    marginBottom: 'auto',
  },
  footer: {
    background: theme.palette.background.v2.footerHeader,
    padding: '40px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  nav: {
    display: 'flex',
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
    padding: '0',
    margin: `0 ${24 / -2}px ${24 / -2}px ${24 / -2}px`,
    listStyle: 'none',
    '& + $nav': {
      marginTop: '32px',
    },
  },
  navItem: {
    margin: `0 ${24 / 2}px ${24 / 2}px ${24 / 2}px`,
  },
  navLink: {
    ...theme.typography['body-lg-med'],
    display: 'block',
    textDecoration: 'none',
    color: theme.palette.text.secondary,
    '& svg': {
      display: 'block',
      fill: 'currentColor',
      width: '24px',
      height: '24px',
    },
    '&:hover': {
      color: theme.palette.text.primary,
    },
  },
});
