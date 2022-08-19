import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  fiatAdornment: {
    background: 'transparent',
    padding: 0,
    margin: 0,
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    cursor: 'pointer' as const,
    display: 'flex',
    alignItems: 'center',
    color: '#F5F5FF',
  },
  flag: {
    marginRight: '8px',
  },
});
