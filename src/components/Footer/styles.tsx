import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: theme.palette.background.appBG,
  },
  wrapperTop: {
    marginBottom: 'auto',
  },
  footer: {
    background: theme.palette.background.footer,
    padding: `${theme.spacing(5)}px`,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  userOnDashboard: {
    backgroundColor: theme.palette.background.alternativeFooterHeader,
  },
  nav: {
    display: 'flex',
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
    padding: '0',
    margin: `0 ${theme.spacing(3) / -2}px ${theme.spacing(3) / -2}px ${theme.spacing(3) / -2}px`,
    listStyle: 'none',
    '& + $nav': {
      marginTop: `${theme.spacing(4)}px`,
    },
  },
  navItem: {
    margin: `0 ${theme.spacing(3) / 2}px ${theme.spacing(3) / 2}px ${theme.spacing(3) / 2}px`,
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
