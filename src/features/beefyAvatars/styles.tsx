export const styles = theme => ({
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatars: {
    minHeight: '100vh',
    backgroundImage: props => `url(${props.bgImage})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'bottom',
    backgroundSize: '100%',
  },
  card: {
    background: '#272B4A',
    borderRadius: '25px',
    color: '#9595B2',
    minWidth: '225px',
    minHeight: '225px',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    border: '3px solid #2E355B',
    boxShadow: '-10px 10px 10px 0px #00000080',
  },
  title: {
    color: '#FFF',
    fontWeight: 700,
    fontStyle: 'bold',
    fontSize: '20px',
    marginBottom: '5px',
  },
  bold: {
    color: '#FFF',
    fontWeight: 700,
    fontStyle: 'bold',
  },
  price: {
    fontWeight: 700,
    fontStyle: 'bold',
    textTransform: 'uppercase',
    '& span': {
      color: '#4f9557',
      fontWeight: 700,
      fontStyle: 'bold',
    },
  },
  btnMint: {
    backgroundColor: '#4f9557',
    fontWeight: 700,
    fontStyle: 'bold',
    maxHeight: '18px',
    maxWidth: '40px',
  },
  pricesContainer: {
    display: 'flex',
    '& span': {
      fontSize: '16px',
    },
  },
  divider: {
    background: '#2E355B',
    borderRadius: '30px',
    width: '6px',
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
});
