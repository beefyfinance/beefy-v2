import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  button: {
    // colors set on variants
    color: 'red',
    backgroundColor: 'blue',
    border: 'solid 2px green',
    borderRadius: '8px',
    fontSize: '15px',
    fontFamily: theme.typography.fontFamily,
    fontWeight: 700,
    lineHeight: '24px',
    minWidth: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 'fit-content',
    margin: 0,
    padding: `${8 - 2}px ${14 - 2}px`, // TEMPFIX: 16->14 iOS font
    cursor: 'pointer',
    userSelect: 'none' as const,
    boxShadow: 'none',
    textAlign: 'center' as const,
    textDecoration: 'none',
    '&:disabled': {
      opacity: '0.4',
      pointerEvents: 'none',
    },
  },
  borderless: {
    borderWidth: 0,
    padding: `8px 16px`,
  },
  fullWidth: {
    width: '100%',
  },
  active: {},
  default: {
    color: '#D0D0DA',
    backgroundColor: '#1B1E31',
    borderColor: '#303550',
    '&:hover': {
      color: '#D0D0DA',
      backgroundColor: '#1B1E31',
      borderColor: '#303550',
    },
  },
  filter: {
    color: '#8A8EA8',
    backgroundColor: '#262A40',
    borderColor: '#303550',
    '&:hover': {
      color: '#D0D0DA',
      backgroundColor: '#262A40',
      borderColor: '#303550',
    },
    '&:active, &$active': {
      color: '#F5F5FF',
      backgroundColor: '#303550',
      borderColor: '#303550',
    },
    '&:disabled': {
      color: '#8A8EA8',
      backgroundColor: '#262A40',
      borderColor: '#303550',
    },
  },
  success: {
    color: '#FFFFFF',
    backgroundColor: '#59A662',
    borderColor: '#59A662',
    '&:hover': {
      color: '#FFFFFF',
      backgroundColor: '#68a871',
      borderColor: '#68a871',
    },
  },
});
