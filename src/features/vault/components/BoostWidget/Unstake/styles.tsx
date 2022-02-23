export const styles = theme => ({
  container: {
    display: 'flex',
    background: '#272B4A',
    borderRadius: '16px',
  },
  inputContainer: {
    marginTop: theme.spacing(4),
    borderRadius: '4px',
    background: theme.palette.background.content,
    padding: '16px',
  },
  maxButton: {
    background: theme.palette.background.content,
    borderRadius: '4px',
    margin: 0,
    padding: '7px 12px',
    fontSize: '12px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    color: theme.palette.text.primary,
    fontWeight: 600,
  },
  positionButton: {
    '& .MuiIconButton-edgeEnd': {
      marginRight: '-8px',
    },
  },
  input: {
    background: theme.palette.background.vaults.inactive,
    borderRadius: '8px',
    maxHeight: '40px',
    width: '100%',
    padding: '12px 16px',
    fontSize: '21px',
    fontWeight: 600,
  },
  width: {
    width: '100%',
  },
  balances: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  available: {
    textAlign: 'left',
  },
  staked: {
    textAlign: 'right',
  },
  content: {
    padding: '0px 24px',
    borderRadius: '4px',
  },
  btnSection: {
    padding: '32px 0px 24px 0px',
  },
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
  label: {
    fontWeight: 600,
    fontSize: '12px',
    lineHeight: '20px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    color: theme.palette.text.disabled,
  },
  value: {
    fontWeight: 600,
    fontSize: '18px',
    lineHeight: '24px',
    letterSpacing: '0.2px',
    textTransform: 'uppercase',
    color: theme.palette.text.secondary,
  },
  btnSubmit: {
    fontSize: '18px',
    fontWeight: 700,
    letterSpacing: '0.2px',
    textTransform: 'none',
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.primary.main,
    borderRadius: '8px',
    padding: '6px 33px',
    '&:hover': {
      backgroundColor: '#389D44',
    },
  },
  removeHover: {
    '&:Hover': {
      background: 'none',
    },
  },
});
