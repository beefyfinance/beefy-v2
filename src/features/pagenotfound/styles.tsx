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
    textAlign: 'center' as const,
  },
  container: {
    margin: '32px auto 0',
    maxWidth: 'calc(100vw - 20%)',
    width: 'fit-content',
  },
  button: {
    margin: '32px auto 0',
  },
});
