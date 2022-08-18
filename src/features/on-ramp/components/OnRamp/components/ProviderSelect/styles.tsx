import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  label: {
    ...theme.typography['subline-sm'],
    color: '#999CB3',
  },
  button: {
    ...theme.typography['body-lg-med'],
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    color: '#D0D0DA',
    background: '#363B63',
    padding: '8px 12px',
    border: 'none',
    borderRadius: '8px',
    margin: 0,
    boxShadow: 'none',
    outline: 'none',
  },
  clickable: {
    cursor: 'pointer',
  },
  unclickable: {
    cursor: 'default',
    pointerEvents: 'none' as const,
  },
  icon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    marginRight: '8px',
  },
  iconLoading: {
    background: 'rgba(255, 255, 255, 0.12);',
  },
  iconProvider: {},
  provider: {
    marginRight: '8px',
  },
  rate: {
    ...theme.typography['body-sm'],
    color: '#999CB3',
    marginRight: '8px',
  },
  arrow: {
    marginLeft: 'auto',
    color: '#D0D0DA',
    height: '24px',
  },
});
