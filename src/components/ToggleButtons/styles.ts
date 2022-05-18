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
    margin: 0,
    padding: '6px 16px',
    flexGrow: 1,
    flexShrink: 0,
    '&:hover': {
      color: '#D0D0DA',
      backgroundColor: 'rgba(245, 245, 255, 0.08)',
      boxShadow: 'none',
    },
    '&:active, &:hover:active': {
      color: '#ffffff',
      backgroundColor: theme.palette.primary.main,
    },
  },
  selected: {
    pointerEvents: 'none' as const,
    color: '#ffffff',
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      color: '#ffffff',
      backgroundColor: theme.palette.primary.main,
    },
  },
  untogglable: {
    '&:hover': {
      color: '#D0D0DA',
      backgroundColor: 'transparent',
    },
    '&:active, &:hover:active': {
      color: '#ffffff',
      backgroundColor: 'transparent',
    },
    '&$selected': {
      pointerEvents: 'all' as const,
      color: '#ffffff',
      backgroundColor: 'transparent',
      '&:hover': {
        color: '#ffffff',
        backgroundColor: 'transparent',
      },
    },
  },
});
