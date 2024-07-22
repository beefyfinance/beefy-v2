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
    '&:disabled,&:hover:disabled,&:active:disabled,&:focus:disabled': {
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
  boost: {
    color: theme.palette.text.light,
    backgroundColor: theme.palette.background.buttons.boost,
    borderColor: theme.palette.background.buttons.boost,
    '&:hover': {
      color: theme.palette.text.light,
      backgroundColor: theme.palette.background.buttons.boostHover,
      borderColor: theme.palette.background.buttons.boostHover,
    },
  },
  default: {
    color: theme.palette.text.light,
    backgroundColor: theme.palette.background.buttons.button,
    borderColor: theme.palette.background.buttons.button,
    '&:hover': {
      color: theme.palette.text.light,
      backgroundColor: theme.palette.background.buttons.buttonHover,
      borderColor: theme.palette.background.buttons.buttonHover,
    },
  },
  middle: {
    color: theme.palette.text.light,
    backgroundColor: '#242842',
    borderColor: '#242842',
    '&:hover': {
      color: theme.palette.text.light,
      backgroundColor: theme.palette.background.buttons.button,
      borderColor: theme.palette.background.buttons.button,
    },
  },
  light: {
    color: theme.palette.text.light,
    backgroundColor: theme.palette.background.buttons.button,
    borderColor: theme.palette.background.buttons.button,
    '&:hover': {
      color: theme.palette.text.light,
      backgroundColor: theme.palette.background.buttons.buttonHover,
      borderColor: theme.palette.background.buttons.buttonHover,
    },
  },
  success: {
    color: theme.palette.text.light,
    backgroundColor: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    '&:hover': {
      color: theme.palette.text.light,
      backgroundColor: theme.palette.primary.light,
      borderColor: theme.palette.primary.light,
    },
  },
  filter: {
    color: theme.palette.text.dark,
    backgroundColor: theme.palette.background.contentDark,
    borderColor: theme.palette.background.contentPrimary,
    '&:hover': {
      color: theme.palette.text.middle,
      backgroundColor: theme.palette.background.contentDark,
    },
    '&:active, &$active': {
      color: theme.palette.text.light,
      backgroundColor: theme.palette.background.buttons.button,
      borderColor: theme.palette.background.contentLight,
    },
    '&:disabled': {
      color: theme.palette.text.middle,
      borderColor: theme.palette.background.contentPrimary,
      opacity: 0.4,
    },
  },
});
