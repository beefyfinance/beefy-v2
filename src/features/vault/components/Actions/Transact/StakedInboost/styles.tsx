import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  container: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.middle,
    padding: '8px 12px',
    borderRadius: '8px',
    display: 'flex',
    gap: '8px',
    background: '#2D3153',
  },
  icon: {
    width: '24px',
    height: '24px',
    flexGrow: 0,
    flexShrink: 0,
  },
  text: {
    flexGrow: 1,
    flexShrink: 1,
  },
  tokenAmount: {
    fontWeight: theme.typography['body-lg-med'].fontWeight,
    color: '#DB8332',
  },
});
