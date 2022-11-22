import { Theme } from '@material-ui/core/styles';

const loadingColor = '#D6D05C';
const warningColor = '#D19847';
const successColor = '#59A662';

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
    '&.open': {
      backgroundColor: '#30354F',
      '& $line': {
        backgroundColor: '#434A6F',
      },
    },
    padding: '0px 16px',
  },
  circle: {
    width: '12px',
    height: '12px',
    borderRadius: '30px',
    '&.loading': {
      backgroundColor: loadingColor,
    },
    '&.success': {
      backgroundColor: successColor,
    },
    '&.warning': {
      backgroundColor: warningColor,
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
      backgroundColor: loadingColor,
    },
    '&.success': {
      backgroundColor: successColor,
    },
    '&.warning': {
      backgroundColor: warningColor,
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
    backgroundColor: '#242737',
    border: '2px solid #30354F',
    borderRadius: '8px',
    marginTop: '4px',
    minWidth: '270px',
    zIndex: 999,
  },
  titleContainer: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${12 - 2}px`,
    backgroundColor: '#30354F',
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
    color: theme.palette.text.disabled,
    '&:hover': {
      color: theme.palette.text.primary,
      cursor: 'pointer',
    },
  },
  content: {
    padding: `${12 - 2}px`,
  },
  contentTitle: {
    ...theme.typography['subline-sm'],
    fontWeight: 700,
    color: theme.palette.text.disabled,
  },
  popoverLine: {
    ...theme.typography['body-sm'],
    color: theme.palette.text.secondary,
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
    backgroundColor: '#30354F',
  },
  chain: {
    display: 'flex',
    alignItems: 'center',
    '& img': {
      height: '24px',
    },
  },
});
