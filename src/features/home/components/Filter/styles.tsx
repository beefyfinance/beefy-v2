export const styles = theme => ({
  categories: {
    paddingBottom: '20px',
    '& .MuiTypography-h4': {
      textTransform: 'uppercase',
      fontSize: '14px',
      fontWeight: '600',
      lineHeight: '18px',
      letterSpacing: '1px',
    },
    '& .MuiButton-root': {
      height: '48px',
      borderRadius: '8px',
      margin: '0',
    },
    [theme.breakpoints.down('sm')]: {
      paddingBottom: '20px',
    },
  },
  text: {
    fontWeight: 700,
    textAlign: 'center',
    textTransform: 'none', //'capitalize' no good due to localization
    transition: 'opacity 0.2s ease-in-out',
  },
  selected: {
    backgroundColor: theme.palette.background.filters.active,
    '& .MuiTypography-root': {
      color: theme.palette.text.primary,
    },
  },
  inactive: {
    backgroundColor: theme.palette.background.filters.inactive,
    border: `2px solid ${theme.palette.background.filters.outline}`,
    '& .MuiTypography-root': {
      color: theme.palette.text.secondary,
    },
  },
  input: {
    fontSize: '15px',
    fontWeight: '700',
    borderWidth: '2px',
    borderRadius: '8px',
    color: theme.palette.text.secondary,
    [theme.breakpoints.up('sm')]: {
      width: 275,
    },
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
  filters: {
    border: `2px solid ${theme.palette.background.filters.outline}`,
    borderRadius: '8px',
    backgroundColor: theme.palette.background.filters.inactive,
    marginTop: 20,
    padding: '16px 24px 24px 24px',
  },
  btnFilter: {
    marginRight: theme.spacing(1),
    textTransform: 'none',
    color: theme.palette.text.secondary,
    fontSize: '15px',
    fontWeight: 700,
    borderRadius: '8px',
    padding: '10px 23px',
    backgroundColor: theme.palette.background.filters.inactive,
    border: `2px solid ${theme.palette.background.filters.outline}`,
    height: 43,
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      width: '40%',
      margin: '0 0 0 0',
    },
    '&.MuiToggleButton-root.Mui-selected': {
      backgroundColor: theme.palette.background.filters.active,
      color: theme.palette.text.primary,
      border: 'none',
    },
  },
  btnFilterActive: {
    backgroundColor: theme.palette.background.vaults.default,
    border: `2px solid ${theme.palette.background.vaults.default}`,
  },
  lblShowing: {
    [theme.breakpoints.up('md')]: {
      textAlign: 'right',
    },
    [theme.breakpoints.up('sm')]: {
      paddingTop: '8px',
    },
    minWidth: 100,
    flexGrow: 1,
    [theme.breakpoints.up('xs')]: {
      minWidth: 'fit-content',
    },
  },
  btnReset: {
    textTransform: 'none',
    color: theme.palette.text.primary,
    fontWeight: 700,
    borderRadius: '8px',
    fontSize: '15px',
    padding: '8px 24px',
    backgroundColor: 'transparent',
    height: 43,
    '&:hover': {
      color: theme.palette.text.primary,
    },
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      width: '40%',
      margin: '0 0 0 0',
    },
  },
  searchInput: {
    borderRadius: 8,
    height: '44px',
    position: 'relative',
    color: theme.palette.text.secondary,
    background: theme.palette.background.filters.inactive,
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        border: `2px solid ${theme.palette.background.filters.outline}`,
      },
      '&:hover fieldset': {
        border: `2px solid ${theme.palette.background.filters.outline}`,
      },
      '&.Mui-focused fieldset': {
        border: `2px solid ${theme.palette.background.filters.outline}`,
      },
    },
    '& .MuiFormLabel-root': {
      fontWeight: 700,
      fontSize: 15,
      lineHeight: '24px',
      color: theme.palette.text.secondary,
    },
    '& .MuiInputBase-root': {
      height: '100%',
    },
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
  iconSearch: {
    borderRadius: 8,
    '&:Hover': {
      backgroundColor: 'transparent',
    },
  },
  checkbox: {
    color: theme.palette.text.disabled,
    '&.MuiCheckbox-root': {
      color: theme.palette.text.disabled,
    },
    '&.Mui-checked': {
      color: theme.palette.text.primary,
    },
  },

  selectors: {
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  selector: {
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1),
    [theme.breakpoints.down('xs')]: {
      marginRight: 0,
      width: '100%',
      marginBottom: '8px',
    },
    '& .MuiBox-root': {
      '& .MuiInputBase-root': {
        [theme.breakpoints.down('sm')]: {
          width: '100%',
        },
      },
    },
  },
  filtersContainer: {
    display: 'flex',
    [theme.breakpoints.down('md')]: {
      flexWrap: 'wrap',
      boxSizing: 'border-box',
    },
  },
  searchContainer: {
    alignItem: 'center',
    flexGrow: 1,
    height: 40,
    [theme.breakpoints.down('md')]: {
      flexGrow: 0,
      width: '60%',
      display: 'flex',
      justifyContent: 'normal',
      margin: '0 0 18px 0',
      paddingRight: theme.spacing(1),
    },
  },
  toggleSwitchContainer: {
    backgroundColor: theme.palette.background.filters.inactive,
    borderRadius: '8px',
    marginRight: '10px',
    border: `2px solid ${theme.palette.background.filters.outline}`,
    width: '350px',
    [theme.breakpoints.down('md')]: {
      width: '100%',
      marginRight: '0',
      margin: '0 0 18px 0',
    },
  },
  toggleSwitchButton: {
    height: '40px',
    borderRadius: '6px',
    padding: '4px 16px',
    textTransform: 'none',
    fontSize: '15px',
    lineHeight: '15px',
    fontWeight: 700,
    color: theme.palette.text.secondary,
    width: 'calc(100% / 3)',
    whiteSpace: 'nowrap',
  },
  toggleSwitchButtonActive: {
    height: '40px',
    borderRadius: '6px',
    padding: '6px 16px',
    textTransform: 'none',
    fontSize: '15px',
    lineHeight: '15px',
    fontWeight: 700,
    color: theme.palette.text.primary,
    backgroundColor: `${theme.palette.primary.main} !important`,
    width: 'calc(100% / 3)',
    whiteSpace: 'nowrap',
  },
  filterIcon: {
    marginRight: '8px',
  },
  sortByContainer: {
    marginRight: theme.spacing(1),
    '& .MuiBox-root': {
      width: '100%',
    },
    '& .MuiSelect-select': {
      minWidth: 'auto',
    },
    [theme.breakpoints.up('sm')]: {
      width: '170px',
    },
    [theme.breakpoints.down('md')]: {
      width: '60%',
      display: 'flex',
      margin: '0 0 0 0',
      paddingRight: '16px',
    },
  },
  filtersSlider: {
    '& div': {
      height: '60px',
    },
  },
  filtersSliderContainer: {
    display: 'flex',
  },
  filterItem: {
    margin: '0px 4px',
    [theme.breakpoints.up(700)]: {
      width: 'calc(20% - 8px) !important',
    },
    [theme.breakpoints.down('md')]: {
      minWidth: '200px',
    },
  },
  boostFilterLabel: {
    display: 'flex',
    marginLeft: '-10px',
  },
  checkboxContainer: {
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  filter: {
    '& .MuiPopover-paper': {
      marginTop: theme.spacing(1),
      borderRadius: '8px',
      width: '350px',
      backgroundColor: theme.palette.background.vaults.default,
      border: `2px solid ${theme.palette.background.vaults.default}`,
      [theme.breakpoints.down('md')]: {
        width: '250px',
      },
    },
  },
  filterContent: { padding: 24 },
  badge: {
    backgroundColor: '#DB5932',
    width: '20px',
    height: '20px',
    borderRadius: 60,
    color: '#fff',
    fontWeight: 700,
    fontSize: 12,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing(1),
  },
  label: {
    color: theme.palette.text.disabled,
  },
  value: {
    textTransform: 'capitalize',
  },
});
