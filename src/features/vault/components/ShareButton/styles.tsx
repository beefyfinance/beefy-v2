import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  shareButton: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    color: theme.palette.text.light,
    backgroundColor: '#363B63',
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
    fontSize: '16px',
  },
  dropdown: {
    width: '200px',
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
