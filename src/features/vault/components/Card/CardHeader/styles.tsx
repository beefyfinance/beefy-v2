import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  container: {
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.palette.background.default,
    borderRadius: '12px 12px 0 0',
    padding: '24px',
  },
});
