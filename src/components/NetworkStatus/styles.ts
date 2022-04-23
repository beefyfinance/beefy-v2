import { Styles } from '@material-ui/core/styles/withStyles';

const loadingColor = '#D6D05C';
const warningColor = '#D19847';
const successColor = '#59A662';

export const styles: Styles<any, any, any> = theme => ({
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
    outline: 'none',
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
    position: 'relative', // to position pulse circles
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
    position: 'absolute',
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
    padding: '12px 16px',
    position: 'relative', // to position the close button
    width: '257px',
    color: '#D0D0DA', // default text color
    lineHeight: '24px', // make everything nicely spaced
  },
  popoverTitle: {
    fontWeight: 'bold',
    fontSize: '15px',
    lineHeight: '24px',
    color: ' #F5F5FF',
    marginRight: '30px', // to leave some room for the close button
    marginBottom: '4px',
  },
  popoverLine: {
    display: 'flex',
    fontSize: '15px',
    alignItems: 'center',
    justifyContent: 'flex-start',
    '& .circle': {
      marginRight: '10px', // space between circle and text
    },
  },
  popoverHelpText: {
    marginTop: '2px',
    letterSpacing: '-0.1px',
  },
  closeButton: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#8A8EA8',
    position: 'absolute',
    width: '20px',
    height: '20px',
    top: '10px',
    right: '10px',
    cursor: 'pointer',
  },

  // https://codepen.io/ndeniche/pen/rNPjmg
  X: {
    position: 'relative',
    height: '100%',
    width: '100%',
    '&::before, &::after': {
      content: '""',
      position: 'absolute',
      width: '100%',
      top: '50%',
      left: '0',
      background: '#8A8EA8',
      height: '2px',
      marginTop: '-1px',
      '&::hover': {
        background: 'red',
      },
    },
    '&::before': {
      transform: 'rotate(45deg)',
    },
    '&::after': {
      transform: 'rotate(-45deg)',
    },
  },
});
