export const styles = theme => ({
  cardActions: {
    marginTop: theme.spacing(1),
    display: 'flex',
  },
  cardAction: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      marginRight: theme.spacing(1),
    },
  },
  text: {
    color: theme.palette.text.secondary,
  },
  detailTitle: {
    color: theme.palette.text.disabled,
    fontSize: '15px',
    lineHeight: '24px',
    letterSpacing: '0.5px',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
});
