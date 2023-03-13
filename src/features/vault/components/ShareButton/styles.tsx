import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  shareButton: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    outline: 'none',
    '&:focus-visible, &.active': {
      outline: 'none',
      backgroundColor: '#363B63',
    },
  },
  mobileAlternative: {
    [theme.breakpoints.down('md')]: {
      borderRadius: '50%',
      padding: '10px',
      '& $shareText': {
        display: 'none',
      },
    },
  },
  shareText: {},
  shareIcon: {
    flexShrink: 0,
    flexGrow: 0,
    fontSize: '16px',
  },
  dropdown: {
    width: 'auto',
    zIndex: 10000,
  },
  dropdownInner: {
    backgroundColor: '#363B63',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    padding: '16px',
  },
  shareItem: {
    ...theme.typography['body-lg-med'],
    whiteSpace: 'nowrap' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: theme.palette.text.light,
    backgroundColor: 'transparent',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    borderRadius: '0',
    margin: 0,
    padding: '0',
    minWidth: 0,
    flexShrink: 0,
    cursor: 'pointer',
    textAlign: 'left' as const,
    '&:hover, &:focus-visible': {
      color: '#fff',
    },
  },
});
