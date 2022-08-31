import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  switcher: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    columnGap: '12px',
    '&::before, &::after': {
      content: '""',
      display: 'block',
      background: '#2D3153',
      height: '2px',
      width: '1px',
      flexShrink: '0',
      flexGrow: '1',
    },
  },
  button: {
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#F5F5FF',
    background: '#363B63',
    border: 'none',
    borderRadius: '50%',
    boxShadow: 'none',
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    userSelect: 'none' as const,
    outline: 'none',
  },
  icon: {
    width: 15,
    height: 13,
    fill: '#F5F5FF',
  },
});
