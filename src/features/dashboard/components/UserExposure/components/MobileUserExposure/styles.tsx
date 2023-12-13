import type { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  container: {
    width: '100%',
    backgroundColor: theme.palette.background.contentPrimary,
    borderRadius: '8px',
    display: 'grid',
    padding: '16px',
    [theme.breakpoints.only('md')]: {
      height: '120px',
    },
  },
  option: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.dark,
    whiteSpace: 'nowrap' as const,
    '&:hover': {
      color: theme.palette.text.light,
      cursor: 'pointer',
    },
  },
  active: {
    color: theme.palette.text.light,
  },
  optionsContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    [theme.breakpoints.down('sm')]: {
      marginBottom: '24px',
    },
  },
});
