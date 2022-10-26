import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
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
    ...theme.typography['body-lg-med'],
    color: theme.palette.background.vaults.defaultOutline,
  },
  statusText: {
    ...theme.typography['body-lg'],
    color: theme.palette.background.vaults.defaultOutline,
    marginLeft: theme.spacing(1),
  },
  successContainer: {
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
  icon: {
    height: '20px',
    marginRight: theme.spacing(1),
  },
  redirectLinkSuccess: {
    ...theme.typography['body-lg'],
    color: theme.palette.primary.main,
    background: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    marginTop: '8px',
    justifyContent: 'flex-start',
    '& .MuiSvgIcon-root': {
      marginLeft: '4px',
    },
  },
  closeBtn: {
    marginTop: theme.spacing(3),
  },
});
