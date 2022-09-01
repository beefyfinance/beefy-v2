import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  search: {
    color: '#D0D0DA',
    background: '#1B1E31',
    borderRadius: '8px',
    '& .MuiInputBase-input': {
      padding: '8px 16px',
      color: '#D0D0DA',
      height: 'auto',
      '&:focus': {
        color: '#F5F5FF',
      },
      '&::placeholder': {
        color: '#8A8EA8',
        opacity: 1,
      },
    },
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
