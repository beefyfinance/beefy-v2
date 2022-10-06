import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  button: {
    padding: '8px 6px 8px 12px',
    margin: 0,
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    background: '#111321',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer' as const,
    gap: '2px',
  },
  iconAssets: {
    width: '32px',
    height: '32px',
    flexShrink: 0,
    flexGrow: 0,
  },
  iconMore: {
    flexShrink: 0,
    flexGrow: 0,
    fill: '#D0D0DA',
  },
});
