export const styles = theme => ({
  itemContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    margin: '20px 0 0 0',
    borderRadius: '20px',
    padding: '24px',
    width: '100%',
    border: '2px solid #383E6B',
    boxShadow: '0px 1px 8px rgba(0,0,0,0.1)',
    background: theme.palette.type === 'dark' ? '#272B4A' : '#FFF',
    '&.hasDeposit': {
      background: '#313759',
      '&:hover': {
        background: '#313759',
      },
    },
    '& div': {
      marginTop: theme.spacing(1),
    },
  },
  bold: {
    fontWeight: 600,
    fontSize: '18px',
    lineHeight: '28px',
    letterSpaccing: '0.2px',
    color: '#FFF',
  },
  text: {
    fontWeight: 400,
    fontSize: '14px',
    lineHeight: '20px',
    letterSpaccing: '0.2px',
    color: '#FFF',
  },

  btn: {
    marginTop: '8px',
    borderRadius: '48px',
    background: '#54995C',
    letterSpaccing: '0.1px',
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 'bold',
    textTransform: 'none',
    padding: '8px 24px',
  },
});
