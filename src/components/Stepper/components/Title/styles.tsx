import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  title: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.background.snackbars.text,
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    height: '20px',
    marginRight: theme.spacing(1),
  },
});
