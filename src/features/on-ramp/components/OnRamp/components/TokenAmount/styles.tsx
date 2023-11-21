import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  label: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.disabled,
    marginBottom: '8px',
  },
  network: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.disabled,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: '12px',
  },
  networkLabel: {
    marginRight: '8px',
  },
  networkButton: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.disabled,
    display: 'flex',
    alignItems: 'center',
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    margin: 0,
    padding: 0,
    cursor: 'pointer' as const,
    '&:hover, &:focus-visible': {
      color: theme.palette.text.secondary,
    },
  },
  networkIcon: {
    marginRight: '8px',
    width: '20px',
    height: '20px',
  },
});
