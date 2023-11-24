import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  search: {
    color: theme.palette.text.secondary,
    background: theme.palette.background.v2.searchBg,
    borderRadius: '8px',
    '&.Mui-focused': {
      '& .MuiInputBase-input': {
        width: '400px',
        [theme.breakpoints.down('md')]: {
          width: '100%',
        },
      },
    },
    '& .MuiInputBase-input': {
      minWidth: '200px',
      transition: '0.2s ease-in-out',
      padding: '8px 16px',
      color: theme.palette.text.secondary,
      height: 'auto',
      '&:focus': {
        color: theme.palette.text.primary,
      },
      '&::placeholder': {
        color: theme.palette.text.disabled,
        opacity: 1,
      },
    },
  },
  active: {
    '& .MuiInputBase-input': {
      width: '400px',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
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
    flexShrink: 0,
    width: '24px',
    height: '24px',
    'button&': {
      cursor: 'pointer',
    },
  },
  activeIcon: {
    color: theme.palette.text.primary,
  },
  disabledIcon: {
    color: theme.palette.text.disabled,
  },
  flex: {
    display: 'flex',
  },
  loader: {
    margin: '0 16px 0 0',
  },
});
