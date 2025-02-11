import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  search: {
    color: theme.palette.text.middle,
    background: theme.palette.background.searchInputBg,
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
      padding: '8px 16px 8px 4px',
      color: theme.palette.text.middle,
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
  leftIcon: {
    margin: '0 0 0 16px',
  },
  activeIcon: {
    color: theme.palette.text.light,
  },
  disabledIcon: {
    color: theme.palette.text.dark,
  },
  flex: {
    display: 'flex',
  },
  loader: {
    margin: '0 0 0 16px',
  },
  enterButton: {
    borderRadius: '4px',
    border: `1px solid ${theme.palette.text.light}`,
  },
});
