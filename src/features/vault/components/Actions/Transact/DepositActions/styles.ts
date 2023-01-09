import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  actions: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
    width: '100%',
  },
});
