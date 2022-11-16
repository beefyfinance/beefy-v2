import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  buttons: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    width: '100%',
  },
});
