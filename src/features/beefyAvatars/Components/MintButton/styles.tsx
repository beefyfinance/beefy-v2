export const styles = theme => ({
  btnMint: {
    backgroundColor: theme.palette.primary.main,
    fontWeight: 'bold',
    fontSize: '16px',
    lineHeight: '24px',
    padding: '8px 24px',
    borderRadius: '8px',
    textTransform: 'none',
    [theme.breakpoints.down('sm')]: {
      width: '50%',
    },
  },
});
