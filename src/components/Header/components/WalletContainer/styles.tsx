export const styles = theme => ({
  container: {
    width: '85%',
    height: 40,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '8px',
    marginLeft: '24px',
    '& .MuiTypography-root': {
      fontWeight: 700,
    },
    '& .MuiGrid-container': {
      flexWrap: 'inherit',
      padding: '8px 16px',
      cursor: 'pointer',
    },
    [theme.breakpoints.up('md')]: {
      width: '100%',
    },
  },
  disconnected: {
    display: 'flex',
    justifyContent: 'center',
    background: theme.palette.background.cta,
    '& .MuiTypography-root': {
      color: theme.palette.text.primary,
    },
  },
  connected: {
    border: `2px solid ${theme.palette.background.cta}`,
    '& .MuiAvatar-root': {
      height: '24px',
      width: '24px',
      marginRight: '8px',
    },
    '& .MuiTypography-root': {
      color: theme.palette.text.secondary,
    },
    '&:hover': {
      borderColor: '#3F466D',
    },
    '&:hover .MuiGrid-container': {
      color: theme.palette.text.middle,
    },
  },
  loading: {
    paddingTop: '4px',
  },
});
