import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {},
  tooltipTrigger: {},
  button: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.dark,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '0',
    minWidth: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 'fit-content',
    margin: 0,
    padding: 0,
    cursor: 'pointer',
    userSelect: 'none' as const,
    boxShadow: 'none',
    textAlign: 'center' as const,
    textDecoration: 'none',
    outline: 'none',
    '&:focus': {
      outline: 'none',
    },
    '&:disabled,&:hover:disabled,&:active:disabled,&:focus:disabled': {
      pointerEvents: 'none',
    },
  },
  icon: {
    width: 20,
    height: 20,
  },
  '@keyframes rotate': {
    from: {
      transform: 'rotate(0deg)',
    },
    to: {
      transform: 'rotate(360deg)',
    },
  },
  canLoad: {},
  loaded: {
    display: 'none' as const,
    '& $icon': {
      color: theme.palette.background.indicators.success,
    },
    '&.$canLoad': {
      display: 'block' as const,
    },
  },
  error: {
    '& $icon': {
      color: theme.palette.background.indicators.warning,
    },
  },
  loading: {
    '& $icon': {
      color: theme.palette.text.dark,
      animationName: '$rotate',
      animationDuration: '3s',
      animationIterationCount: 'infinite',
      animationTimingFunction: 'linear',
    },
  },
});
