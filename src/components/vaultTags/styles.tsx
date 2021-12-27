export const styles = theme => ({
  tags: {
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.5px',
    padding: '3px 8px',
    borderRadius: '5px',
    margin: '2px 0 0 6px',
    textTransform: 'uppercase',
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.filters.active,
    [theme.breakpoints.down('md')]: {
      wordBreak: 'none',
      letterSpacing: '0.2px',
      fontSize: '10px',
    },
  },
  spacingMobile: {
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      justifyContent: 'center',
      padding: '5px 0',
    },
  },
});
