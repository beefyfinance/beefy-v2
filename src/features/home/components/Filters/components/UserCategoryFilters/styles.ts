import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  button: {
    paddingLeft: '10px',
    paddingRight: '10px',
  },
  selected: {
    backgroundColor: theme.palette.primary.main,
  },
});
