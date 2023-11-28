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
    width: '500px',
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
  },
  tokenDetails: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  tokenLabel: {
    ...theme.typography['subline-sm'],
  },
  tokenValue: {},
  copyText: {
    position: 'relative' as const,
  },
  copyTextInput: {
    ...theme.typography['body-lg'],
    lineHeight: '20px',
    background: theme.palette.background.searchInputBg,
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    borderRadius: '8px',
    width: '100%',
    display: 'flex',
    cursor: 'default',
    padding: '12px 48px 12px 16px',
    color: theme.palette.text.light,
    height: 'auto',
  },
  copyTextButton: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    height: '100%',
    background: 'none',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    cursor: 'pointer',
    color: theme.palette.text.middle,
    '&:hover': {
      color: theme.palette.text.light,
    },
  },
  buttons: {
    marginTop: '24px',
  },
});
