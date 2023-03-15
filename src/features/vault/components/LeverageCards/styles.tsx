import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  container: {},
  title: {
    ...theme.typography.h2,
    color: theme.palette.text.primary,
  },
});
