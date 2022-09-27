import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  title: {
    ...theme.typography.h2,
    color: theme.palette.text.primary,
  },
  container: {
    marginTop: 24,
  },
});
