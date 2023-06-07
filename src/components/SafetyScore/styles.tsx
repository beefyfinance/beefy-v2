import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  barsContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    margin: 'auto 0 2px 4px',
  },
  bar: {
    backgroundColor: theme.palette.text.disabled,
    width: '5px',
    borderRadius: '1px',
    '& + $bar': {
      marginLeft: '4px',
    },
  },
  sm: {
    height: '11px',
  },
  md: {
    height: '14px',
  },
  lg: {
    height: '19px',
  },
  withSizeMedium: {
    alignItems: 'center',
    '& $barsContainer': {
      margin: '0 0 0 8px',
    },
  },
  withScoreLow: {
    '& $sm': {
      backgroundColor: theme.palette.primary.main,
    },
  },
  withScoreMed: {
    '& $sm': {
      backgroundColor: theme.palette.primary.main,
    },
    '& $md': {
      backgroundColor: theme.palette.primary.main,
    },
  },
  withScoreHigh: {
    '& $sm': {
      backgroundColor: theme.palette.primary.main,
    },
    '& $md': {
      backgroundColor: theme.palette.primary.main,
    },
    '& $lg': {
      backgroundColor: theme.palette.primary.main,
    },
  },
  withRightAlign: {
    justifyContent: 'flex-end',
  },
});
