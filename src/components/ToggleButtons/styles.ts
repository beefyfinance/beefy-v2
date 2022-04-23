import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  buttons: {
    display: 'flex',
    width: 'fit-content',
    border: 'solid 2px #303550',
    borderRadius: '8px',
    backgroundColor: '#262A40',
  },
  fullWidth: {
    width: '100%',
  },
  button: {
    color: '#8A8EA8',
    backgroundColor: '#262A40',
    fontSize: '15px',
    fontFamily: theme.typography.fontFamily,
    fontWeight: 700,
    lineHeight: '24px',
    border: 'none',
    borderRadius: '6px',
    boxShadow: 'none',
    cursor: 'pointer',
    padding: '6px 16px',
    flexGrow: 1,
    flexShrink: 0,
    '&:hover, &:focus': {
      color: '#D0D0DA',
      backgroundColor: 'rgba(245, 245, 255, 0.08)',
      outline: 'none',
      boxShadow: 'none',
    },
    '&:active, &:hover:active, &:focus:active': {
      color: '#ffffff',
      backgroundColor: theme.palette.primary.main,
    },
  },
  selected: {
    pointerEvents: 'none' as const,
    color: '#ffffff',
    backgroundColor: theme.palette.primary.main,
    '&:hover, &:focus': {
      color: '#ffffff',
      backgroundColor: theme.palette.primary.main,
    },
  },
  untogglable: {
    '&:hover, &:focus': {
      color: '#D0D0DA',
      backgroundColor: 'transparent',
    },
    '&:active, &:hover:active, &:focus:active': {
      color: '#ffffff',
      backgroundColor: 'transparent',
    },
    '&$selected': {
      pointerEvents: 'all' as const,
      color: '#ffffff',
      backgroundColor: 'transparent',
      '&:hover, &:focus': {
        color: '#ffffff',
        backgroundColor: 'transparent',
      },
    },
  },
});
