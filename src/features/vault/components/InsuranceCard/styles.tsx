import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  header: {
    alignItems: 'center',
    backgroundColor: theme.palette.background.default,
    borderRadius: '12px 12px 0 0',
    padding: '24px',
    display: 'flex',
    '& img': {
      marginRight: theme.spacing(2),
      height: 48,
      width: 48,
    },
  },
  title: {
    color: theme.palette.text.primary,
  },
  subtitle: {
    color: theme.palette.text.disabled,
    textTransform: 'uppercase' as const,
    fontWeight: 600,
  },
  content: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(3),
  },
  btn: {
    color: theme.palette.text.primary,
    fontSize: '15px',
    lineHeight: '24px',
    fontWeight: 700,
    padding: '12px 24px',
    borderRadius: '8px',
    backgroundColor: theme.palette.background.default,
    textTransform: 'none' as const,
    width: '100%',
  },
  link: {
    textDecoration: 'none',
    width: '100%',
  },
});
