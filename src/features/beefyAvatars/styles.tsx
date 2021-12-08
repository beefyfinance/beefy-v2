export const styles = theme => ({
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatars: {
    minHeight: '100vh',
    position: 'relative',
    backgroundImage: props =>
      `url(${props.bgImage}),url(${props.item}), url(${props.item1}), url(${props.item}),url(${props.item1})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'bottom,1% 10%, 90% 45%, 5% 90%,90% 85%',
    backgroundSize: '100%,15%,25%,25%,15%',
    paddingBottom: '200px',
    opacity: 1,
  },
  card: {
    background: '#272B4A',
    borderRadius: '25px',
    color: '#9595B2',
    minWidth: '225px',
    minHeight: '225px',
    maxWidth: '80%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    border: '3px solid #2E355B',
    boxShadow: '-10px 10px 10px 0px #00000080',
  },
  cardHeader: {
    borderRadius: '0px 0px 10px 10px',
    border: '3px solid #2E355B',
    borderTop: 'none',
    borderRight: 'none',
    borderLeft: 'none',
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
    '&.MuiDivider-flexItem': {
      height: '150px',
      alignSelf: 'center',
    },
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
});
