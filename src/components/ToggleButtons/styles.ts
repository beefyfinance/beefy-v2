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
    ...theme.typography['body-lg-med'],
    color: '#8A8EA8',
    backgroundColor: 'inherit',
    border: 'none',
    borderRadius: '6px',
    boxShadow: 'none',
    cursor: 'pointer',
    margin: 0,
    padding: `6px 16px`,
    flexGrow: 1,
    flexShrink: 0,
    '&:hover': {
      color: '#D0D0DA',
      backgroundColor: 'rgba(245, 245, 255, 0.08)',
      boxShadow: 'none',
    },
    '&:active, &:hover:active': {
      color: '#ffffff',
    },
  },
  selected: {
    pointerEvents: 'none' as const,
    color: '#ffffff',
    backgroundColor: theme.palette.background.vaults.defaultOutline,
    '&:hover': {
      color: '#ffffff',
      backgroundColor: theme.palette.background.vaults.defaultOutline,
    },
  },
  untogglable: {
    padding: `${8 - 2}px ${16 - 12 - 2}px`,
    '& $button': {
      padding: '0 12px',
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
  },
});
