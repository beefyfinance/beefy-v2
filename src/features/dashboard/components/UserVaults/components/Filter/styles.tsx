import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    backgroundColor: theme.palette.background.v2.filter,
    borderRadius: '8px 8px 0px 0px',
    padding: '16px',
    display: 'grid',
    width: '100%',
    columnGap: '8px',
    backgroundClip: 'padding-box',
    gridTemplateColumns: 'minmax(0, 30fr) minmax(0, 70fr)',
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: 'minmax(0, 70fr) minmax(0, 30fr)',
    },
  },
  sortColumns: {
    display: 'grid',
    width: '100%',
    columnGap: '8px',
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
    [theme.breakpoints.up('md')]: {
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    },
    [theme.breakpoints.up('lg')]: {
      gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    },
  },
  search: {
    color: theme.palette.text.dark,
    background: '#07080D',
    borderRadius: '8px',
    '& .MuiInputBase-input': {
      padding: '8px 16px',
      color: theme.palette.text.dark,
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
    color: '#D0D0DA',
    flexShrink: 0,
    width: '24px',
    height: '24px',
    'button&': {
      cursor: 'pointer',
    },
  },
  hideSm: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  hideMd: {
    display: 'none',
    [theme.breakpoints.up('lg')]: {
      display: 'flex',
    },
  },
});
