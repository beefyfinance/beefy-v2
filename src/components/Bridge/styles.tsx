import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  modal: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    boxShadow: '24px',
    width: '400px',
    height: '620px',
  },
  container: {
    borderRadius: '20px',
    '&.MuiPaper-elevation1': {
      boxShadow: '0px 0px 32px 0px #0000001A',
    },
  },

  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '18px 24px',
    background: theme.palette.background.vaults.inactive,
    borderRadius: '10px 10px 0px 0px ',
    borderBottom: '2px solid #2D3153',
  },
  title: {
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  powerBy: {
    color: theme.palette.text.secondary,
  },
  content: {
    padding: '24px',
    borderRadius: '4px',
  },
  btn: {
    height: '48px',
    width: '100%',
    padding: '12px 24px',
    textTransform: 'none' as const,
    borderRadius: '8px',
    backgroundColor: theme.palette.primary.main,
    '& .MuiButton-label': {
      fontWeight: 700,
      color: '#FFF',
    },
    '&.Mui-disabled': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    '&:hover': {
      backgroundColor: '#389D44',
    },
  },
  fees: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.content,
    borderRadius: '8px',
    margin: `${theme.spacing(1.5)}px 0px`,
  },
  lastMarginFees: {
    margin: `${theme.spacing(1.5)}px 0px 16px 0px`,
  },
  feesContent: {
    display: 'flex',
    flexWrap: 'wrap' as const,
  },
  feesItem: {
    marginBottom: theme.spacing(1.5),
    width: '50%',
  },
  advice: {
    color: theme.palette.text.disabled,
    margin: `${theme.spacing(1)}px 0px`,
  },
  advice1: {
    color: theme.palette.text.disabled,
  },
  label: {
    color: theme.palette.text.disabled,
    letterSpacing: '0.5px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
  },
  value: {
    fontWeight: 600,
    color: theme.palette.text.secondary,
  },
  balance: {
    color: theme.palette.text.disabled,
    '& span': {
      paddingLeft: '4px',
      fontWeight: 600,
      color: theme.palette.text.secondary,
    },
    '&:Hover': {
      cursor: 'pointer',
    },
  },
  address: {
    color: theme.palette.text.disabled,
    '& span': {
      color: theme.palette.text.secondary,
    },
  },
  flexContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  inputContainer: {
    width: '50%',
    '& .MuiPaper-root': {
      display: 'flex',
      alignItems: 'center',
      position: 'relative' as const,
      height: '40px',
      backgroundColor: theme.palette.background.vaults.inactive,
      borderRadius: '8px',
      padding: 0,
      margin: 0,
      boxShadow: 'none',
      '& .MuiInputBase-input': {
        padding: '10px 5px 8px 40px',
        fontSize: '15px',
        fontWeight: 600,
      },
    },
    '& .MuiTextField-root': {
      backgroundColor: theme.palette.background.vaults.inactive,
      borderRadius: '8px',
      padding: '3px 10px',
    },
    '& .MuiButton-root': {
      fontSize: '12px',
      fontWeight: 600,
      letterSpacing: '0.5px',
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.vaults.defaultOutline,
      borderRadius: '4px',
      margin: 0,
      padding: '2px 12px',
      position: 'absolute',
      right: '5px',
      minWidth: 0,
    },
    '& .MuiInputBase-root': {
      width: '100%',
    },
  },
  inputLogo: {
    position: 'absolute' as const,
    top: '11px',
    left: '12px',
  },
  networkPicker: {
    width: '50%',
    marginRight: theme.spacing(1),
    '& .MuiFormControl-root': {
      width: '100%',
    },
  },
  networkValue: {
    display: 'flex',
    color: `${theme.palette.text.secondary}`,
    fontWeight: 700,
  },
  networkContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  chainName: {
    fontWeight: 700,
    color: theme.palette.text.secondary,
  },
  bridgedValue: {
    fontWeight: 700,
    color: theme.palette.text.disabled,
  },
  icon: {
    height: '20px',
    marginRight: '4px',
  },
  alignDropdown: {
    '& .MuiTypography-body1': {
      lineHeight: 'normal',
    },
  },
  networkPickerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px',
  },
  cross: {
    color: theme.palette.text.disabled,
    '&:Hover': {
      cursor: 'pointer',
    },
  },
});
