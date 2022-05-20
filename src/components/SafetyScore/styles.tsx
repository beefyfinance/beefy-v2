export const styles = theme => ({
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
    color: 'inherit',
    fontFamily: theme.typography.fontFamily,
    fontWeight: 700,
    fontSize: '15px',
    lineHeight: 1,
    textAlign: 'center' as const,
  },
  bar: {
    backgroundColor: theme.palette.text.disabled,
    width: '5px',
    borderRadius: '2px',
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
    '& $barsContainer': {
      marginBottom: '4px',
    },
    '& $label': {
      fontSize: '24px',
    },
    '& $sm': {
      height: '13px',
    },
    '& $md': {
      height: '21px',
    },
    '& $lg': {
      height: '29px',
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
    '&.$withScoreLow': {
      '& $label': {
        color: '#E84525',
      },
    },
    '&.$withScoreMed': {
      '& $label': {
        color: '#E88225',
      },
    },
    '&.$withScoreHigh': {
      '& $label': {
        color: theme.palette.primary.main,
      },
    },
  },
  withRightAlign: {
    justifyContent: 'flex-end',
  },
});
