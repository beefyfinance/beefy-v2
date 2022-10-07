import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  successContent: {
    backgroundColor: 'rgba(89, 166, 98, 0.15)',
  },
  errorContent: {
    backgroundColor: 'rgba(219, 50, 50, 0.1)',
  },
  content: {
    marginTop: theme.spacing(1.5),
    padding: '16px',
    borderRadius: '4px',
  },
  message: {
    color: theme.palette.background.snackbars.text,
    '& span': {
      fontWeight: theme.typography['body-lg-med'].fontWeight,
    },
  },
  friendlyMessage: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.background.snackbars.text,
    marginBottom: theme.spacing(2),
  },
  closeBtn: {
    marginTop: theme.spacing(3),
  },
  rememberContainer: {
    marginTop: theme.spacing(2),
  },
  icon: {
    height: '20px',
    marginRight: theme.spacing(1),
  },
});
