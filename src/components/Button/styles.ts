import type { Theme } from '@material-ui/core';

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
    outline: 'none',
    '&:focus': {
      outline: 'none',
    },
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
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.default,
    borderColor: theme.palette.background.default,
    '&:hover': {
      color: theme.palette.text.primary,
      backgroundColor: '#2C3154',
      borderColor: '#2C3154',
    },
  },
  middle: {
    color: theme.palette.text.primary,
    backgroundColor: '#242842',
    borderColor: '#242842',
    '&:hover': {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.v2.border,
      borderColor: theme.palette.background.v2.border,
    },
  },
  light: {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.v2.border,
    borderColor: theme.palette.background.v2.border,
    '&:hover': {
      color: theme.palette.text.primary,
      backgroundColor: '#3F4574',
      borderColor: '#3F4574',
    },
  },
  success: {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.v2.cta,
    borderColor: theme.palette.background.v2.cta,
    '&:hover': {
      color: theme.palette.text.primary,
      backgroundColor: '#68a871',
      borderColor: '#68a871',
    },
  },
  filter: {
    color: theme.palette.text.disabled,
    backgroundColor: theme.palette.background.v2.contentDark,
    borderColor: theme.palette.background.v2.contentPrimary,
    '&:hover': {
      color: theme.palette.text.secondary,
      backgroundColor: theme.palette.background.v2.contentDark,
    },
    '&:active, &$active': {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.v2.button,
      borderColor: theme.palette.background.v2.contentLight,
    },
    '&:disabled': {
      color: theme.palette.text.secondary,
      borderColor: theme.palette.background.v2.contentPrimary,
      opacity: 0.4,
    },
  },
});
