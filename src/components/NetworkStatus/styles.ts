import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    height: '40px',
    border: 'none',
    borderRadius: '8px',
    columnGap: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    padding: '0px 16px 0px 0px',
  },
  circle: {
    width: '12px',
    height: '12px',
    borderRadius: '30px',
    '&.loading': {
      backgroundColor: theme.palette.background.indicators.loading,
    },
    '&.success': {
      backgroundColor: theme.palette.background.indicators.success,
    },
    '&.warning': {
      backgroundColor: theme.palette.background.indicators.warning,
    },
    position: 'relative' as const, // to position pulse circles
  },
  // https://www.kirupa.com/animations/creating_pulsing_circle_animation.htm
  '@keyframes scaleIn': {
    from: { transform: 'scale(.5, .5)', opacity: '.7' },
    to: { transform: 'scale(3.0, 3.0)', opacity: '0' },
  },
  pulseCircle: {
    borderRadius: '50%',
    // w/h same as circle
    width: '12px',
    height: '12px',
    position: 'absolute' as const,
    opacity: 0,
    animation: '$scaleIn 4s infinite cubic-bezier(.36, .11, .89, .32)',
    '&.loading': {
      backgroundColor: theme.palette.background.indicators.loading,
    },
    '&.success': {
      backgroundColor: theme.palette.background.indicators.success,
    },
    '&.warning': {
      backgroundColor: theme.palette.background.indicators.warning,
    },
    '&.notLoading': {
      display: 'none',
    },
    '&:nth-child(1)': {
      animationDelay: '0s',
    },
    '&:nth-child(2)': {
      animationDelay: '1s',
    },
    '&:nth-child(3)': {
      animationDelay: '2s',
    },
    '&:nth-child(4)': {
      animationDelay: '3s',
    },
  },
  dropdown: {
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: theme.palette.background.contentPrimary,
    border: `solid 2px ${theme.palette.background.contentDark}`,
    borderRadius: '8px',
    marginTop: '4px',
    minWidth: '280px',
    zIndex: 999,
  },
  titleContainer: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.light,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${12 - 2}px`,
    backgroundColor: theme.palette.background.contentDark,
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    '& img': {
      height: '24px',
      margin: '0px 4px',
    },
  },
  cross: {
    color: theme.palette.text.dark,
    '&:hover': {
      color: theme.palette.text.light,
      cursor: 'pointer',
    },
  },
  content: {
    padding: `${12 - 2}px`,
  },
  contentTitle: {
    ...theme.typography['subline-sm'],
    fontWeight: 700,
    color: theme.palette.text.dark,
  },
  popoverLine: {
    ...theme.typography['body-sm'],
    color: theme.palette.text.middle,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    '& .circle': {
      marginRight: '8px',
    },
    '& + $popoverLine': {
      marginTop: '4px',
    },
  },
  popoverHelpText: {
    ...theme.typography['body-sm'],
    marginTop: '8px',
  },
  line: {
    height: '16px',
    width: '2px',
    borderRadius: '3px',
    backgroundColor: theme.palette.background.contentLight,
  },
  chain: {
    display: 'flex',
    alignItems: 'center',
    '& img': {
      height: '24px',
    },
  },
});
