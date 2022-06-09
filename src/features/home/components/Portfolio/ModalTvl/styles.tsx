import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  holder: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    minWidth: '400px',
    outline: 'none',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 24px',
    background: theme.palette.background.vaults.inactive,
    borderRadius: '10px 10px 0px 0px ',
    borderBottom: '2px solid #373c68',
  },
  title: {
    color: theme.palette.text.primary,
  },
  removeHover: {
    '&:hover': {
      background: 'none',
    },
  },
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: theme.palette.background.paper,
    borderRadius: '0 0 12px 12px',
    padding: '24px',
  },
  btn: {
    marginTop: theme.spacing(4),
  },
  chain: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1),
    borderRadius: '4px',
    backgroundColor: theme.palette.background.content,
  },
  chainText: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.disabled,
  },
  chainValue: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.secondary,
  },
  chainLogo: {
    height: '32px',
    width: '32px',
    marginRight: '8px',
  },
});
