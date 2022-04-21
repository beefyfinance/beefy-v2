export const styles = theme => ({
  container: {
    width: '100%',
    height: 40,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '8px',
    '& .MuiTypography-root': {
      fontWeight: 700,
    },
    '& .MuiGrid-container': {
      flexWrap: 'inherit',
      padding: '8px 16px',
      cursor: 'pointer',
    },
  },
  disconnected: {
    display: 'flex',
    justifyContent: 'center',
    background: theme.palette.background.cta,
    '& .MuiTypography-root': {
      color: theme.palette.text.primary,
      textOverflow: 'clip',
    },
  },
  known: {
    border: `2px solid #D19847`,
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
  connected: {
    borderColor: theme.palette.background.cta,
  },
  loading: {
    paddingTop: '4px',
  },
  blurred: {
    filter: 'blur(.5rem)',
  },
});
