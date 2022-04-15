export const styles = theme => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 24px',
    background: theme.palette.background.vaults.inactive,
    borderRadius: '10px 10px 0px 0px ',
    borderBottom: '2px solid #373c68',
  },
  title: {
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  removeHover: {
    '&:Hover': {
      background: 'none',
    },
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
    borderRadius: '0 0 12px 12px',
    padding: '24px',
  },
  btn: {
    backgroundColor: theme.palette.primary.main,
    borderRadius: '8px',
    width: '100%',
    height: '48px',
    marginTop: theme.spacing(4),
    '& .MuiButton-label': {
      textTransform: 'none',
      fontWeight: 600,
      color: theme.palette.text.primary,
    },
  },
  chain: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1),
    borderRadius: '4px',
    backgroundColor: theme.palette.background.content,
  },
  chainText: {
    textTransform: 'uppercase',
    color: theme.palette.text.disabled,
    letterSpacing: '0.5px',
    fontWeight: 600,
  },
  chainValue: {
    color: theme.palette.text.secondary,
    fontWeight: 700,
  },
  chainLogo: {
    height: '32px',
    width: '32px',
    marginRight: '8px',
  },
});
