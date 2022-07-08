import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  content: {
    padding: '24px',
    borderRadius: '4px',
    backgroundColor: '#232743',
  },
  rowDirectionBalance: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
  },
  label: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.disabled,
  },
  balance: {
    ...theme.typography['body-sm'],
    cursor: 'pointer',
    color: theme.palette.text.disabled,
    '& span': {
      paddingLeft: '4px',
      fontWeight: theme.typography['body-sm-med'].fontWeight,
      color: theme.palette.text.secondary,
    },
  },
  toContainer: {
    marginBottom: '24px',
  },
  buttonContainer: {
    marginTop: '24px',
  },
  rowChainInput: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  inputContainer: {
    width: '50%',
    '& .MuiPaper-root': {
      position: 'relative' as const,
      backgroundColor: theme.palette.background.vaults.inactive,
      borderRadius: '8px',
      padding: 0,
      margin: 0,
      boxShadow: 'none',
      '& .MuiInputBase-input': {
        ...theme.typography['body-lg-med'],
        height: 'auto',
        padding: `8px 8px 8px ${12 + 20 + 8}px`,
      },
    },
    '& .MuiButton-root': {
      ...theme.typography['subline-sm'],
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.vaults.defaultOutline,
      borderRadius: '4px',
      margin: 0,
      padding: '2px 12px',
      position: 'absolute' as const,
      top: '8px',
      right: '8px',
      minWidth: 0,
    },
    '& .MuiInputBase-root': {
      width: '100%',
    },
  },
  inputLogo: {
    position: 'absolute' as const,
    top: '10px',
    left: '12px',
    display: 'block',
  },
  networkPicker: {
    width: '50%',
    marginRight: theme.spacing(1),
  },
});
