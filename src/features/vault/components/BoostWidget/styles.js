const styles = theme => ({
  container: {
    padding: theme.spacing(3),
    backgroundColor: '#313759',
    borderRadius: '16px',
  },
  boostImg: {
    width: 30,
    height: 30,
  },
  h1: {
    fontSize: '24px',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: '#E88225',
  },
  h2: {
    fontSize: '24px',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: '#ffffff',
  },
  body1: {
    fontSize: '14px',
    lineHeight: '18px',
    color: '#8585A6',
    letterSpacing: '0.2px',
  },
  submit: {
    fontSize: '21px',
    marginTop: theme.spacing(2),
    fontWeight: 700,
    letterSpacing: '0.2px',
    textTransform: 'none', //'capitalize' no good due to localization
    color: '#ffffff',
    backgroundColor: '#54995C',
    borderRadius: '30px',
    zIndex: 0,
    '&:hover': {
      backgroundColor: '#389D44',
    },
    '&:disabled': {
      backgroundColor: '#434864',
    },
  },
});

export default styles;
