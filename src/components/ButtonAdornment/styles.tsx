import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  button: {
    ...theme.typography['body-lg-med'],
    color: '#D0D0DA',
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    margin: 0,
    padding: 0,
    whiteSpace: 'nowrap' as const,
    cursor: 'pointer' as const,
    '&:hover, &:focus-visible': {
      color: '#F5F5FF',
      '& $arrow': {
        color: '#D0D0DA',
      },
    },
  },
  arrow: {
    color: '#999CB3',
    height: '24px',
  },
});
