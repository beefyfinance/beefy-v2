export const styles = theme => ({
  container: {
    padding: theme.spacing(3),
    backgroundColor: '#313759',
    borderRadius: '16px',
  },
  containerExpired: {
    padding: '24px 24px 0.1px 24px',
    backgroundColor: '#3F466D',
    borderRadius: '16px',
    marginTop: '-24px',
  },
  expiredBoostContainer: {
    background: '#555D8B',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '20px',
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
  h1white: {
    fontSize: '24px',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: '#FFFFFF',
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
    borderRadius: '8px',
    zIndex: 0,
    marginBottom: '12px',
    '&:hover': {
      backgroundColor: '#232743',
    },
    '&:disabled': {
      backgroundColor: '#272C47',
      color: '#D1D3E0',
    },
  },
  blockBtn: {
    marginLeft: 'auto',
    marginRight: '0',
    border: 'none',
    padding: 0,
    width: 32,
  },
});
