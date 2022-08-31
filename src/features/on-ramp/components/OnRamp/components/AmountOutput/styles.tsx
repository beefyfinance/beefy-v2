import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  input: {
    color: '#D0D0DA',
    background: '#1B1E31',
    borderRadius: '8px',
    width: '100%',
    display: 'flex',
    cursor: 'default',
    '& .MuiInputBase-input': {
      ...theme.typography['h2'],
      padding: '8px 16px',
      color: '#D0D0DA',
      height: 'auto',
      cursor: 'default',
      '&:focus': {
        color: '#F5F5FF',
      },
      '&::placeholder': {
        color: '#8A8EA8',
        opacity: 1,
      },
    },
  },
  pending: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    padding: '8px 16px',
  },
  icon: {
    background: 'transparent',
    padding: 0,
    border: 0,
    margin: '0 16px 0 0',
    boxShadow: 'none',
    lineHeight: 'inherit',
    display: 'flex',
    alignItems: 'center',
    color: '#D0D0DA',
    flexShrink: 0,
    width: '24px',
    height: '24px',
    'button&': {
      cursor: 'pointer',
    },
  },
});
