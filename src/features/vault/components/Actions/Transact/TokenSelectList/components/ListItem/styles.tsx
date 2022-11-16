import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  item: {
    ...theme.typography['body-lg-med'],
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    color: '#999CB3',
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    userSelect: 'none' as const,
    outline: 'none',
    '&:hover, &:focus-visible': {
      color: '#D0D0DA',
      '& $arrow': {
        color: '#fff',
      },
    },
  },
  icon: {
    width: '24px',
    height: '24px',
    marginRight: '8px',
  },
  symbol: {
    marginRight: 'auto',
  },
  balance: {},
  arrow: {
    marginLeft: '12px',
    color: '#D0D0DA',
    height: '24px',
  },
});
