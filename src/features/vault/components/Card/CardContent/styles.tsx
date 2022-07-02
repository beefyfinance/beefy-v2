import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: theme.palette.background.content,
    borderRadius: '0 0 12px 12px',
    padding: '24px',
  },
});
