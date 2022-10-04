import { Theme } from '@material-ui/core';

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
  label: {
    ...theme.typography['body-lg-med'],
    color: 'inherit',
    lineHeight: 1,
    textAlign: 'center' as const,
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
    '& $label': {
      ...theme.typography['h2'],
    },
  },
  withScoreLow: {
    '& $sm': {
      backgroundColor: '#E84525',
    },
  },
  withScoreMed: {
    '& $sm': {
      backgroundColor: '#E88225',
    },
    '& $md': {
      backgroundColor: '#E88225',
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
  withWhiteLabel: {
    '& $label': {
      color: theme.palette.type === 'dark' ? '#ffffff' : '#000',
    },
  },
  withColorLabel: {
    '&$withScoreLow': {
      '& $label': {
        color: '#E84525',
      },
    },
    '&$withScoreMed': {
      '& $label': {
        color: '#E88225',
      },
    },
    '&$withScoreHigh': {
      '& $label': {
        color: theme.palette.primary.main,
      },
    },
  },
  withRightAlign: {
    justifyContent: 'flex-end',
  },
});
