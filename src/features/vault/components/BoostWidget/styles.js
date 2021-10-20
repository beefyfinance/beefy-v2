const styles = theme => ({
  container: {
    padding: theme.spacing(3),
    backgroundColor: '#313759',
    borderRadius: '16px',
  },
  boostImg: {
    width: 30,
    height: 30,
    marginLeft: '-8px',
  },
  h1: {
    fontSize: '24px',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: '#E88225',
  },
  h2: {
    fontSize: '18px',
    lineHeight: '24px',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: '#ffffff',
    marginBottom: '16px',
  },
  body1: {
    fontSize: '12px',
    lineHeight: '20px',
    color: '#8585A6',
    fontWeight: '600',
    letterSpacing: '0.2px',
    textTransform: 'uppercase',
  },
  button: {
    fontSize: '18px',
    fontWeight: 600,
    height: '48px',
    lineHeight: '24px',
    letterSpacing: '0.2px',
    textTransform: 'none', //'capitalize' no good due to localization
    color: '#D1D3E0',
    backgroundColor: '#232743',
    borderRadius: '30px',
    zIndex: 0,
    marginBottom: '12px',
    '&:hover': {
      backgroundColor: '#232743',
    },
    '&:disabled': {
      backgroundColor: '#282C48',
      color: '#D1D3E0',
    },
  },
});

export default styles;
