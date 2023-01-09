import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
});
