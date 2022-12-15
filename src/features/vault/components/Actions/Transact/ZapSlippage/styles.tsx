import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  container: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.middle,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  titleToggle: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.dark,
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    background: 'transparent',
    padding: 0,
    margin: 0,
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    cursor: 'pointer' as const,
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  valueIcon: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
  },
  value: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  excessSlippage: {},
  warning: {
    color: '#D19847',
  },
  danger: {
    color: '#D15347',
  },
  icon: {},
  selector: {
    border: '2px solid #363B63',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden' as const,
    '& > $option:first-child': {
      borderTopLeftRadius: '0',
      borderBottomLeftRadius: '0',
    },
    '& > $option:last-child': {
      borderTopRightRadius: '0',
      borderBottomRightRadius: '0',
    },
  },
  option: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.dark,
    flexBasis: 'auto',
    flexShrink: 0,
    flexGrow: 1,
    borderRadius: '8px',
    background: 'transparent',
    padding: '6px 16px',
    margin: 0,
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    textTransform: 'none' as const,
    '&:hover': {
      backgroundColor: '#2D3153',
    },
  },
  button: {
    cursor: 'pointer' as const,
  },
  selected: {
    color: theme.palette.text.light,
    backgroundColor: '#2D3153',
  },
  custom: {
    width: '5em',
    flexShrink: 0,
    flexGrow: 2,
    position: 'relative' as const,
    '& > $option': {
      borderTopRightRadius: '0',
      borderBottomRightRadius: '0',
    },
  },
  customPlaceholder: {
    cursor: 'pointer' as const,
    textAlign: 'center' as const,
    color: theme.palette.text.dark,
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  customInput: {
    textAlign: 'center' as const,
    width: '100%',
    color: theme.palette.text.light,
  },
  customHidden: {
    opacity: 0,
    pointerEvents: 'none' as const,
  },
  tooltipTrigger: {
    width: '16px',
    height: '16px',
    margin: 0,
    display: 'block',
    '& svg': {
      width: '16px',
      height: '16px',
      display: 'block',
    },
  },
});
