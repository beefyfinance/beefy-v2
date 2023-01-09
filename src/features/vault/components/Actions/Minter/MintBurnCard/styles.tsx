import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  header: {
    backgroundColor: '#272B4A',
    borderRadius: '12px',
  },
  tabs: {
    backgroundColor: theme.palette.background.vaults.inactive,
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(50%, 1fr))',
  },
  tab: {
    borderBottom: 'solid 2px transparent',
    color: theme.palette.text.disabled,
    background: 'none',
    padding: 0,
    margin: 0,
    height: '56px',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    '&:first-child:last-child': {
      pointerEvents: 'none',
    },
    '&:hover': {
      background: 'none',
    },
  },
  selected: {
    color: `${theme.palette.text.primary}`,
    borderBottom: `solid 2px ${theme.palette.text.disabled}`,
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: theme.palette.background.default,
    borderRadius: '0 0 12px 12px',
    padding: '24px',
  },
  logo: {
    height: '50px',
  },
  content: {
    color: theme.palette.text.secondary,
  },
  btn: {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.primary.main,
    padding: '12px 24px',
    borderRadius: '8px',
    '&:hover': {
      backgroundColor: '#389D44',
    },
    '&.Mui-disabled': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
  },
  info: {
    display: 'flex',
    marginBottom: theme.spacing(2),
  },
  info2: {
    marginBottom: theme.spacing(3),
  },
  item: {
    marginRight: theme.spacing(4),
  },
  inputContainer: {
    margin: '24px 0',
    '& .MuiPaper-root': {
      position: 'relative' as const,
      backgroundColor: theme.palette.background.vaults.inactive,
      borderRadius: '8px',
      padding: 0,
      margin: 0,
      boxShadow: 'none',
      '& .MuiInputBase-input': {
        ...theme.typography['h3'],
        height: 'auto',
        padding: `12px 8px 12px ${16 + 24 + 8}px`,
      },
    },
    '& .MuiButton-root': {
      ...theme.typography['subline-sm'],
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.vaults.defaultOutline,
      borderRadius: '4px',
      margin: 0,
      padding: '6px 12px',
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
    top: '12px',
    left: '12px',
  },
  balances: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
  },
  label: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.disabled,
  },
  value: {
    ...theme.typography['body-sm'],
    color: theme.palette.text.secondary,
  },
  customDivider: {
    display: 'flex',
    alignItems: 'center',
    '& img': {
      margin: '0 12px',
    },
  },
  line: {
    height: '2px',
    width: '100%',
    backgroundColor: theme.palette.background.vaults.default,
    borderRadius: '8px',
  },
  boxReminder: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: theme.spacing(0.5),
    backgroundColor: theme.palette.background.content,
  },
  boxReserves: {
    ...theme.typography['subline-lg'],
    display: 'flex',
    flexWrap: 'wrap' as const,
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: theme.spacing(0.5),
    backgroundColor: theme.palette.background.content,
  },
  reservesText: {
    color: theme.palette.text.disabled,
    marginRight: theme.spacing(0.5),
  },
  amountReserves: {
    marginLeft: theme.spacing(0.5),
    color: theme.palette.text.secondary,
  },
  noReserves: {
    marginTop: theme.spacing(2),
  },
});
