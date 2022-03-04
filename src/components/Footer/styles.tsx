import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  footer: {
    background: theme.palette.background.footer,
    marginTop: '40px',
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
    margin: '0 -12px -12px -12px',
    listStyle: 'none',
    '& + $nav': {
      marginTop: '32px',
    },
  },
  navItem: {
    margin: '0 12px 12px 12px',
  },
  navLink: {
    display: 'block',
    textDecoration: 'none',
    textTransform: 'capitalize' as const,
    fontWeight: 'bold' as const,
    fontSize: '15px',
    lineHeight: '24px',
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
