import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  header: {
    backgroundColor: theme.palette.background.contentDark,
    borderRadius: '12px',
  },
  tabs: {
    backgroundColor: theme.palette.background.contentDark,
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(50%, 1fr))',
  },
  tab: {
    borderBottom: 'solid 2px transparent',
    color: theme.palette.text.dark,
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
    color: theme.palette.text.light,
    borderBottom: `solid 2px ${theme.palette.text.dark}`,
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: theme.palette.background.contentPrimary,
    borderRadius: '0 0 12px 12px',
    padding: '24px',
    [theme.breakpoints.down('sm')]: {
      padding: '16px',
    },
  },
  logo: {
    height: '50px',
  },
  content: {
    color: theme.palette.text.middle,
  },
  btn: {
    color: theme.palette.text.light,
    backgroundColor: theme.palette.background.buttons.button,
    padding: '12px 24px',
    borderRadius: '8px',
    '&.Mui-disabled': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
  },
  info: {
    display: 'flex',
    marginBottom: '16px',
  },
  info2: {
    marginBottom: '24px',
  },
  item: {
    marginRight: '32px',
  },
  inputContainer: {
    margin: '24px 0',
    '& .MuiPaper-root': {
      position: 'relative' as const,
      backgroundColor: theme.palette.background.searchInputBg,
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
      color: theme.palette.text.light,
      backgroundColor: theme.palette.background.buttons.button,
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
    marginBottom: '8px',
  },
  label: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.dark,
  },
  value: {
    ...theme.typography['body-sm'],
    color: theme.palette.text.middle,
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
    backgroundColor: theme.palette.background.contentLight,
    borderRadius: '8px',
  },
  boxReminder: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    marginTop: '16px',
    padding: '16px',
    borderRadius: '4px',
    backgroundColor: theme.palette.background.contentLight,
  },
  boxReserves: {
    ...theme.typography['subline-lg'],
    display: 'flex',
    flexWrap: 'wrap' as const,
    marginTop: '16px',
    padding: '16px',
    borderRadius: '4px',
    backgroundColor: theme.palette.background.contentLight,
  },
  reservesText: {
    color: theme.palette.text.dark,
    marginRight: '4px',
  },
  amountReserves: {
    marginLeft: '4px',
    color: theme.palette.text.middle,
  },
  noReserves: {
    marginTop: '16px',
  },
});
