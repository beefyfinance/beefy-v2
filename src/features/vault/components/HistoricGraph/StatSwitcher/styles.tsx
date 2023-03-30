import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  tabs: {
    marginTop: '16px',
    backgroundColor: theme.palette.background.default,
    [theme.breakpoints.up('sm')]: {
      marginTop: 0,
    },
  },
});
