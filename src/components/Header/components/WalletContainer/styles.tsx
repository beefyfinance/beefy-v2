import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    width: '100%',
    height: 40,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '8px',
    '& .MuiGrid-container': {
      flexWrap: 'inherit',
      padding: '8px 16px',
      cursor: 'pointer',
    },
  },
  address: {
    ...theme.typography['body-lg-med'],
    whiteSpace: 'nowrap' as const,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  disconnected: {
    display: 'flex',
    justifyContent: 'center',
    background: theme.palette.background.cta,
    '& $address': {
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
    '& $address': {
      color: theme.palette.text.secondary,
    },
    '&:hover': {
      borderColor: '#3F466D',
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
