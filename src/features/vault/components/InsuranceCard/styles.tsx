import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    '& img': {
      marginRight: theme.spacing(2),
      height: 48,
      width: 48,
    },
  },
  title: {
    ...theme.typography['h2'],
    color: theme.palette.text.primary,
  },
  subtitle: {
    ...theme.typography['subline-lg'],
    color: theme.palette.text.disabled,
  },
  content: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(3),
  },
  btn: {
    color: theme.palette.text.primary,
    padding: '12px 24px',
    borderRadius: '8px',
    backgroundColor: theme.palette.background.default,
    width: '100%',
  },
});
