import { Theme } from '@material-ui/core/styles';

const borderWidth = 2;
const paddings: Record<string, Record<'x' | 'y', number>> = {
  sm: {
    x: 16,
    y: 8,
  },
  lg: {
    // default
    x: 24,
    y: 12,
  },
};

export const styles = (theme: Theme) => ({
  button: {
    ...theme.typography['body-lg-med'],
    // colors set on variants
    color: 'red',
    backgroundColor: 'blue',
    border: `solid ${borderWidth}px green`,
    borderRadius: '8px',
    minWidth: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 'fit-content',
    margin: 0,
    padding: `${paddings.lg.y - borderWidth}px ${paddings.lg.x - borderWidth}px`,
    cursor: 'pointer',
    userSelect: 'none' as const,
    boxShadow: 'none',
    textAlign: 'center' as const,
    textDecoration: 'none',
    '&:disabled': {
      color: 'rgba(255, 255, 255, 0.38)',
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      borderColor: 'rgba(255, 255, 255, 0.12)',
      pointerEvents: 'none',
    },
  },
  borderless: {
    borderWidth: 0,
    padding: `${paddings.lg.y}px ${paddings.lg.x}px`,
  },
  fullWidth: {
    width: '100%',
  },
  active: {},
  sm: {
    padding: `${paddings.sm.y - borderWidth}px ${paddings.sm.x - borderWidth}px`,
    '&$borderless': {
      padding: `${paddings.sm.y}px ${paddings.sm.x}px`,
    },
  },
  default: {
    color: '#F5F5FF',
    backgroundColor: '#232743',
    borderColor: '#232743',
    '&:hover': {
      color: '#F5F5FF',
      backgroundColor: '#2C3154',
      borderColor: '#2C3154',
    },
  },
  light: {
    color: '#F5F5FF',
    backgroundColor: '#363B63',
    borderColor: '#363B63',
    '&:hover': {
      color: '#F5F5FF',
      backgroundColor: '#3F4574',
      borderColor: '#3F4574',
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
      opacity: 0.4,
    },
  },
});
