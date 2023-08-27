import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  search: {
    color: theme.palette.text.dark,
    background: '#07080D',
    borderRadius: '8px',
    '& .MuiInputBase-input': {
      padding: '8px 16px',
      color: theme.palette.text.dark,
      height: 'auto',
      '&:focus': {
        color: theme.palette.text.primary,
      },
      '&::placeholder': {
        color: theme.palette.text.dark,
        opacity: 1,
      },
    },
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
    color: '#D0D0DA',
    flexShrink: 0,
    width: '24px',
    height: '24px',
    'button&': {
      cursor: 'pointer',
    },
  },
});
