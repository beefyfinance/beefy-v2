import { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  scroller: {
    position: 'relative' as const,
    [theme.breakpoints.down('md')]: {
      overflowX: 'scroll',
      '&::-webkit-scrollbar': {
        display: 'none',
      },
    },
  },
  shadow: {
    position: 'absolute' as const,
    height: '100%',
    top: 0,
    pointerEvents: 'none' as const,
    transition: 'opacity 0.1s linear',
  },
  leftShadow: {
    left: 0,
    background: 'linear-gradient(to left, rgba(0,0,0,0),rgba(0,0,0,0.5))',
    width: '20px',
  },
  rightShadow: {
    right: 0,
    background: 'linear-gradient(to right, rgba(0,0,0,0),rgba(0,0,0,0.5))',
    width: '20px',
  },
});
