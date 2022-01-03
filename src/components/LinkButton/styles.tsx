export const styles = theme => ({
  container: {
    display: 'inline-flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    textDecoration: 'none',
    backgroundColor: theme.palette.background.vaults.defaultOutline,
    padding: '2px 8px',
    borderRadius: '4px',
    [theme.breakpoints.down('md')]: {
      margin: '4px 0px',
    },
  },
  text: {
    fontStyle: 'normal',
    textAlign: 'center',
    color: theme.palette.text.secondary,
    flex: 'none',
    order: 0,
    flexGrow: 0,
    margin: '0px 4px',
    textTransform: 'capitalize',
  },
});
