import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& .MuiBackdrop-root': {
      backgroundColor: 'rgba(0,0,0,0.9)',
    },
    '& .MuiAlert-root': {
      marginTop: '20px',
    },
  },
  finishedCard: {
    backgroundColor: '#323857',
    borderRadius: '20px',
  },
  finishedBtn: {
    color: '#6B7199',
    backgroundColor: '#232841',
    padding: '4px 15px',
    transition: 'color 0.2s',
    '&:hover': {
      color: '#ffffff',
      transition: 'color 0.2s',
    },
  },
  snackbar: {
    width: '408px',
    maxWidth: 'calc(100% - 16px)',
    maxHeight: 'calc(100% - 16px)',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    flexDirection: 'column' as const,
  },
  snackbarContainer: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: 0,
  },
  topBar: {
    height: '10px',
    borderRadius: '4px 4px 0 0',
    backgroundColor: theme.palette.background.snackbars.bgLine,
    flexShrink: 0,
    flexGrow: 0,
  },
  progressBar: {
    width: '50%',
    margin: 0,
    backgroundColor: theme.palette.primary.main,
    height: '100%',
    borderRadius: '4px 0 0 0',
  },
  progressBar25: {
    width: '25%',
    margin: 0,
    backgroundColor: theme.palette.primary.main,
    height: '100%',
    borderRadius: '4px 0 0 0',
  },
  progressBar50: {
    width: '50%',
    margin: 0,
    backgroundColor: theme.palette.primary.main,
    height: '100%',
    borderRadius: '4px 0 0 0',
  },
  progressBar75: {
    width: '75%',
    margin: 0,
    backgroundColor: theme.palette.primary.main,
    height: '100%',
    borderRadius: '4px 0 0 0',
  },
  progressBar1: {
    width: '75%',
    margin: 0,
    backgroundColor: theme.palette.primary.main,
    height: '100%',
    borderRadius: '4px 0 0 0',
  },
  confirmationBar: {
    width: '75%',
    margin: 0,
    backgroundColor: theme.palette.primary.main,
    height: '100%',
    borderRadius: '4px 0 0 0',
  },
  successBar: {
    width: '100%',
    margin: 0,
    height: '100%',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '4px 4px 0 0',
  },
  errorBar: {
    width: '100%',
    margin: 0,
    height: '100%',
    backgroundColor: theme.palette.background.snackbars.error,
    borderRadius: '4px 4px 0 0',
  },
  icon: {
    height: '20px',
    marginRight: theme.spacing(1),
  },
  titleContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    flexShrink: 0,
    marginBottom: '4px',
  },
  closeIcon: {
    padding: 0,
  },
  contentContainer: {
    backgroundColor: theme.palette.background.snackbars.bg,
    borderRadius: '0 0 4px 4px',
    padding: '12px 16px',
    minHeight: 0,
    flexShrink: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'auto',
  },
  title: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.background.snackbars.text,
    display: 'flex',
    alignItems: 'center',
  },
  friendlyMessage: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.background.snackbars.text,
    marginBottom: theme.spacing(2),
  },
  message: {
    color: theme.palette.background.snackbars.text,
    '& span': {
      fontWeight: theme.typography['body-lg-med'].fontWeight,
    },
  },
  content: {
    marginTop: theme.spacing(1.5),
    padding: '16px',
    borderRadius: '4px',
  },
  errorContent: {
    backgroundColor: 'rgba(219, 50, 50, 0.1)',
  },
  successContent: {
    backgroundColor: 'rgba(89, 166, 98, 0.15)',
  },
  closeBtn: {
    marginTop: theme.spacing(3),
  },
  redirectLinkSuccess: {
    color: theme.palette.primary.main,
    background: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    marginTop: '16px',
    '& .MuiSvgIcon-root': {
      marginLeft: '4px',
    },
  },
  chainContainer: {
    backgroundColor: theme.palette.background.contentLight,
    borderRadius: theme.spacing(0.5),
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  statusContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  chainStatusContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  chainName: {
    color: theme.palette.background.vaults.defaultOutline,
    fontWeight: 700,
  },
  statusText: {
    color: theme.palette.background.vaults.defaultOutline,
    fontWeight: 400,
    marginLeft: theme.spacing(1),
  },
  succesContainer: {
    borderRadius: theme.spacing(0.5),
    backgroundColor: 'rgba(89, 166, 98, 0.15)',
    padding: theme.spacing(2),
    marginTop: theme.spacing(1.5),
  },
  textSuccess: {
    color: theme.palette.primary.main,
  },
  errorMessage: {
    marginTop: theme.spacing(1.5),
  },
});
