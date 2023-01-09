import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  container: {},
  divider: {
    marginBottom: '16px',
  },
  tokenAmounts: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    width: '100%',
  },
  route: {
    marginTop: '24px',
  },
  slippage: {
    marginTop: '24px',
  },
});
