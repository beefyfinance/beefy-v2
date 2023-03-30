import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  header: {
    [theme.breakpoints.up('sm')]: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  },
  content: {
    padding: 0,
  },
});
