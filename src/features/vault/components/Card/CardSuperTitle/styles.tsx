import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  supertitle: {
    ...theme.typography['subline-lg'],
    color: theme.palette.text.disabled,
  },
});
