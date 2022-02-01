export const styles = theme => ({
  tags: {
    fontSize: '10px',
    lineHeight: '20px',
    fontWeight: 600,
    letterSpacing: '0.5px',
    padding: '2px 8px',
    borderRadius: '4px',
    margin: '2px 0 0 6px',
    textTransform: 'uppercase',
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.filters.active,
    display: 'flex',
    alignItems: 'center',
    '& img': {
      height: '16px !important',
      marginRight: 4,
    },
    [theme.breakpoints.down('md')]: {
      letterSpacing: '0.2px',
    },
  },
  spacingMobile: {
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      padding: '5px 0',
    },
  },
  text: {
    fontSize: '10px',
    lineHeight: '20px',
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  tagImage: {
    width: '20px',
    height: '16px',
  },
});
