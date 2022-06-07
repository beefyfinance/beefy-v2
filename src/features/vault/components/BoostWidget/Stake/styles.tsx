import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  container: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    minWidth: '400px',
  },
  inputContainer: {
    marginTop: theme.spacing(4),
    borderRadius: '4px',
    background: theme.palette.background.content,
    padding: '16px',
  },
  maxButton: {
    ...theme.typography['subline-sm'],
    background: theme.palette.background.content,
    borderRadius: '4px',
    margin: 0,
    padding: '2px 12px',
    color: theme.palette.text.primary,
  },
  positionButton: {},
  input: {
    ...theme.typography['body-lg-med'],
    background: theme.palette.background.vaults.inactive,
    borderRadius: '8px',
    maxHeight: '40px',
    width: '100%',
    padding: '8px 12px',
  },
  width: {
    width: '100%',
  },
  balances: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  available: {
    textAlign: 'left' as const,
  },
  staked: {
    textAlign: 'right' as const,
  },
  content: {
    padding: '0px 24px',
    borderRadius: '4px',
  },
  btnSection: {
    padding: '32px 0px 24px 0px',
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
    ...theme.typography['h2'],
    color: theme.palette.text.primary,
  },
  label: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.disabled,
  },
  value: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.secondary,
  },
  btnSubmit: {},
  closeIcon: {
    '&:hover': {
      background: 'none',
    },
  },
});
