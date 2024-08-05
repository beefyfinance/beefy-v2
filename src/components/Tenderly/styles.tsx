import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  cardHolder: {
    position: 'absolute' as const,
    outline: 'none',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    [theme.breakpoints.down('xs')]: {
      padding: '0',
    },
  },
  card: {
    margin: 0,
    maxHeight: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    width: '1000px',
    maxWidth: '100%',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '18px 24px',
    background: theme.palette.background.contentDark,
    borderRadius: '10px 10px 0px 0px ',
    borderBottom: `2px solid ${theme.palette.background.border}`,
  },
  cardIcon: {
    marginRight: '8px',
  },
  cardTitle: {
    color: theme.palette.text.light,
    marginRight: 'auto',
  },
  closeButton: {
    '&:hover': {
      background: 'none',
    },
  },
  cardContent: {
    background: theme.palette.background.contentPrimary,
    borderRadius: '0 0 12px 12px',
    padding: '24px',
    minHeight: '200px',
    flexShrink: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflowY: 'auto' as const,
  },
});
