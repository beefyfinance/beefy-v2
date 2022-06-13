import { Theme } from '@material-ui/core/styles';

const loadingColor = '#D6D05C';
const warningColor = '#D19847';
const successColor = '#59A662';

export const styles = (theme: Theme) => ({
  container: {
    width: '44px',
    height: '40px',
    border: '2px solid #30354F',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    padding: 0,
    '&.open': {
      backgroundColor: '#242737',
    },
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
  floating: {
    zIndex: 1000,
  },
  popoverPaper: {
    backgroundColor: 'transparent',
  },
  popoverSpacer: {
    height: '4px', // space between button and content
    width: '100%',
  },
  popover: {
    border: '2px solid #30354F',
    backgroundColor: '#242737',
    borderRadius: '8px',
    padding: `${12 - 2}px ${16 - 2}px`,
    position: 'relative' as const, // to position the close button
    width: '257px',
    maxWidth: 'min(100%, 380px)',
    color: '#D0D0DA', // default text color
    lineHeight: '24px', // make everything nicely spaced
  },
  popoverTitle: {
    ...theme.typography['body-lg-med'],
    color: '#F5F5FF',
    paddingRight: '32px', // to leave some room for the close button
    marginBottom: '8px',
    '&:last-child': {
      marginBottom: 0,
    },
  },
  popoverLine: {
    ...theme.typography['body-sm'],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    '& .circle': {
      marginRight: '10px', // space between circle and text
    },
    '& + $popoverLine': {
      marginTop: '4px',
    },
  },
  popoverHelpText: {
    ...theme.typography['body-sm'],
    marginTop: '8px',
  },
  closeIconButton: {
    color: '#8A8EA8',
    position: 'absolute' as const,
    fontSize: '22px',
    width: '22px',
    height: '22px',
    top: `${12 - 2}px`,
    right: `${16 - 2}px`,
    cursor: 'pointer',
  },
});
