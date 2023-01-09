import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  holder: {
    display: 'flex',
    position: 'relative' as const,
    width: '100%',
    justifyContent: 'center',
    '&::before, &::after': {
      content: '""',
      display: 'block',
      position: 'absolute' as const,
      top: 'calc(50% - 1px)',
      height: '2px',
      background: '#2D3153',
      width: 'calc((100% - 48px)/2)',
    },
    '&::before': {
      left: 0,
    },
    '&::after': {
      right: 0,
    },
  },
  arrow: {
    fill: theme.palette.text.light,
    width: '15px',
    height: '18px',
  },
});
