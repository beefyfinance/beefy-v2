import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  search: {
    color: '#D0D0DA',
    background: '#1B1E31',
    borderRadius: '8px',
    '&.Mui-focused': {
      '& .MuiInputBase-input': {
        width: '375px',
        [theme.breakpoints.down('md')]: {
          width: '100%',
        },
      },
    },
    '& .MuiInputBase-input': {
      transition: '0.5s ease-in-out',
      padding: '8px 16px',
      color: '#D0D0DA',
      height: 'auto',
      '&:focus': {
        color: '#F5F5FF',
      },
      '&::placeholder': {
        color: '#8A8EA8',
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
});
