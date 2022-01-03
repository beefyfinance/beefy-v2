export const styles = theme => ({
  tags: {
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.5px',
    padding: '2px 8px',
    borderRadius: '5px',
    margin: '2px 0 0 6px',
    textTransform: 'uppercase',
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.filters.active,
    [theme.breakpoints.down('md')]: {
      letterSpacing: '0.2px',
      fontSize: '10px',
    },
  },
  spacingMobile: {
    [theme.breakpoints.down('sm')]: {
      padding: '5px 0',
    },
  },
});
