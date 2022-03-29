export const styles = theme => ({
  pageContainer: {
    backgroundColor: theme.palette.background.footer,
    paddingBottom: '20px',
  },
  imageContainer: {
    margin: '0 auto',
    width: 'fit-content',
    paddingTop: '40px',
  },
  image: {
    maxWidth: 'calc(100vw - 10%)',
    height: '60vh',
    [theme.breakpoints.down('md')]: {
      height: 'auto',
    },
    margin: '0 auto',
    display: 'block',
  },
  text: {
    fontWeight: '600',
    fontSize: '18px',
    lineHeight: '28px',
    textAlign: 'center',
  },
  container: {
    margin: '32px auto 0',
    maxWidth: 'calc(100vw - 20%)',
    width: 'fit-content',
  },
  button: {
    border: 'solid 2px #54995C',
    backgroundColor: '#54995C',
    borderRadius: '8px',
    color: 'white',
    fontSize: '16px',
    fontWeight: 700,
    padding: '12px 24px',
    textTransform: 'capitalize',
    display: 'block',
    margin: '32px auto 0',
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: theme.palette.type === 'dark' ? 'transparent' : '#54995C',
    },
  },
});
