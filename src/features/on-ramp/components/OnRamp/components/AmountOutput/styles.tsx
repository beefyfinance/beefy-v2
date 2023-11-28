import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  input: {
    color: theme.palette.text.middle,
    background: theme.palette.background.searchInputBg,
    borderRadius: '8px',
    width: '100%',
    display: 'flex',
    cursor: 'default',
    '& .MuiInputBase-input': {
      ...theme.typography['h2'],
      padding: '8px 16px',
      color: theme.palette.text.middle,
      height: 'auto',
      cursor: 'default',
      '&:focus': {
        color: theme.palette.text.light,
      },
      '&::placeholder': {
        color: theme.palette.text.dark,
        opacity: 1,
      },
    },
  },
  pending: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    padding: '8px 16px',
  },
  icon: {
    background: 'transparent',
    padding: 0,
    border: 0,
    margin: '0 16px 0 0',
    boxShadow: 'none',
    lineHeight: 'inherit',
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.text.middle,
    flexShrink: 0,
    width: '24px',
    height: '24px',
    'button&': {
      cursor: 'pointer',
    },
  },
});
