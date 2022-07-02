export const styles = theme => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    '& img': {
      marginRight: theme.spacing(2),
    },
  },
  title: {
    ...theme.typography['h2'],
    color: theme.palette.text.primary,
  },
  logo: {
    height: '80px',
    width: '80px',
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
  subtitle: {
    ...theme.typography['subline-lg'],
    color: theme.palette.text.disabled,
  },
});
