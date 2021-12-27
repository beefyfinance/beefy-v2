export const styles = theme => ({
  itemContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    margin: '20px 0 0 0',
    borderRadius: '8px',
    padding: '24px',
    width: '100%',
    border: `2px solid ${theme.palette.background.vaults.defaultOutline}`,
    boxShadow: '0px 1px 8px rgba(0,0,0,0.1)',
    background: theme.palette.background.vaults.default,
    '& div': {
      marginTop: theme.spacing(1),
    },
  },
  bold: {
    letterSpaccing: '0.2px',
    color: theme.palette.text.primary,
  },
  text: {
    fontWeight: 400,
    letterSpaccing: '0.2px',
    color: theme.palette.text.secondary,
  },

  btn: {
    marginTop: '8px',
    borderRadius: '8px',
    background: '#54995C',
    letterSpaccing: '0.1px',
    fontSize: '15px',
    lineHeight: '24px',
    fontWeight: 700,
    textTransform: 'none',
    padding: '8px 24px',
  },
});
