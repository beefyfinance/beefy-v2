import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '8px',
    padding: '8px 16px',
  },
  address: {
    ...theme.typography['body-lg-med'],
    whiteSpace: 'nowrap' as const,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    '&:hover': {
      cursor: 'pointer',
    },
  },
  disconnected: {
    display: 'flex',
    justifyContent: 'center',
    background: theme.palette.background.v2.cta,
    '& $address': {
      color: theme.palette.text.primary,
      textOverflow: 'clip',
    },
  },
  known: {
    border: `2px solid ${theme.palette.background.v2.indicators.warning}`,
    '& $address': {
      color: theme.palette.text.secondary,
    },
    '&:hover': {
      borderColor: theme.palette.background.v2.contentLight,
    },
  },
  connected: {
    borderColor: theme.palette.background.cta,
    backgroundColor: theme.palette.background.v2.contentDark,
  },
  loading: {
    paddingTop: '4px',
  },
  blurred: {
    filter: 'blur(.5rem)',
  },
});
