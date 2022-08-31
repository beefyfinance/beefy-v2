import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  label: {
    ...theme.typography['subline-sm'],
    color: '#999CB3',
    marginBottom: '8px',
  },
  network: {
    ...theme.typography['subline-sm'],
    color: '#999CB3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: '12px',
  },
  networkLabel: {
    marginRight: '8px',
  },
  networkButton: {
    ...theme.typography['subline-sm'],
    color: '#999CB3',
    display: 'flex',
    alignItems: 'center',
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    margin: 0,
    padding: 0,
    cursor: 'pointer' as const,
    '&:hover, &:focus-visible': {
      color: '#D0D0DA',
    },
  },
  networkIcon: {
    marginRight: '8px',
    width: '20px',
    height: '20px',
  },
});
