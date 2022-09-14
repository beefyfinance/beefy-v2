import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  rowDirectionBalance: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
  },
  label: {
    ...theme.typography['subline-sm'],
    fontWeight: 700,
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
  inputContainer: {
    '& .MuiPaper-root': {
      position: 'relative' as const,
      backgroundColor: theme.palette.background.vaults.inactive,
      borderRadius: '8px',
      padding: 0,
      margin: 0,
      boxShadow: 'none',
      '& .MuiInputBase-input': {
        ...theme.typography.h2,
        height: 'auto',
        padding: `8px 8px 8px ${12 + 24 + 8}px`,
      },
    },
  },
  inputLogo: {
    position: 'absolute' as const,
    top: '12px',
    left: '12px',
    display: 'block',
  },
  networkPicker: {
    width: '50%',
    marginRight: theme.spacing(1),
  },
  infoContainer: { flexGrow: 1 },
});
