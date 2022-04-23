import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  search: {
    color: '#D0D0DA',
    '& .MuiOutlinedInput-notchedOutline': {
      display: 'none',
    },
    '& .MuiInputLabel-root': {
      top: '50%',
      transform: 'translate(16px, -50%) scale(1)',
      transition: 'top 0.2s ease, transform 0.2s ease',
      fontSize: '15px',
      lineHeight: '24px',
      fontWeight: 700,
      color: '#D0D0DA',
      '&.MuiInputLabel-shrink': {
        top: 0,
        transform: 'translate(16px, -50%) scale(0.75)',
      },
      '&.Mui-focused': {
        color: 'inherit',
      },
    },
    '& .MuiInputBase-root': {
      background: '#1B1E31',
      borderRadius: '8px',
    },
    '& .MuiInputBase-input': {
      padding: '8px 16px',
      fontSize: '15px',
      lineHeight: '24px',
      fontWeight: 700,
      color: '#D0D0DA',
      height: 'auto',
    },
  },
  icon: {
    background: 'transparent',
    padding: 0,
    border: 0,
    boxShadow: 'none',
    outline: 'none',
    lineHeight: 'inherit',
    display: 'flex',
    alignItems: 'center',
    color: '#D0D0DA',
    'button&': {
      cursor: 'pointer',
    },
  },
});
