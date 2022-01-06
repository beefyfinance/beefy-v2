export const styles = theme => ({
  header: {
    alignItems: 'center',
    backgroundColor: theme.palette.background.default,
    borderRadius: '12px 12px 0 0',
    padding: '24px',
    display: 'flex',
    '& img': {
      marginRight: theme.spacing(2),
    },
  },
  title: {
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
    fontSize: '15px',
    lineHeight: '24px',
    fontWeight: 700,
    padding: '12px 24px',
    backgroundColor: theme.palette.background.default,
    textTransform: 'none',
  },
  subtitle: {
    color: theme.palette.text.disabled,
    letterSpacing: '0.5px',
    fontWeight: 600,
  },
  subtitle1: {
    color: theme.palette.text.disabled,
    letterSpacing: '0.5px',
    fontWeight: 400,
  },
  info: {
    display: 'flex',
    marginBottom: theme.spacing(3),
  },
  item: {
    marginRight: theme.spacing(4),
  },
  itemInfo: {
    color: theme.palette.text.secondary,
    fontWeight: 600,
  },
});
