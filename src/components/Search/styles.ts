import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  search: {
    color: theme.palette.text.dark,
    background: theme.palette.background.searchInputBg,
    borderRadius: '8px',
    '& .MuiInputBase-input': {
      padding: '8px 16px 8px 4px',
      color: theme.palette.text.dark,
      height: 'auto',
      '&:focus': {
        color: theme.palette.text.light,
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
    color: theme.palette.text.dark,
    flexShrink: 0,
    width: '24px',
    height: '24px',
    'button&': {
      cursor: 'pointer',
    },
  },
  searchIconMargin: {
    margin: '0 0 0 16px',
  },
  focusIcon: {
    border: `1px solid ${theme.palette.text.dark}`,
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    fontWeight: 500,
  },
});
