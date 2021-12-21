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
      backgroundBlendMode: 'soft-light, normal',
      '&:hover': {
        '& .MuiTypography-root': {
          opacity: 1,
          transition: 'opacity 0.2s ease-in-out',
        },
      },
    },
    '& .MuiButton-root.Mui-disabled': {
      color: '#ffffff',
      '& .MuiTypography-root': {
        opacity: 1,
      },
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
    [theme.breakpoints.down(725)]: {
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
    textTransform: 'none',
    color: theme.palette.text.secondary,
    fontSize: '15px',
    fontWeight: 700,
    borderRadius: '8px',
    padding: '10px 23px',
    backgroundColor: theme.palette.background.filters.inactive,
    border: `2px solid ${theme.palette.background.filters.outline}`,
    height: 43,
    [theme.breakpoints.down(725)]: {
      display: 'flex',
      width: '30%',
      margin: '0 0 18px 0',
    },
    '&.MuiToggleButton-root.Mui-selected': {
      backgroundColor: theme.palette.background.filters.active,
      color: theme.palette.text.primary,
      border: 'none',
    },
  },
  btnResetContainer: {
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
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
  filtersInner: {
    display: 'flex',
  },
  btnReset: {
    color: theme.palette.type === 'dark' ? '#ffffff' : '#000000',
    fontWeight: '600',
    borderWidth: '2px',
    borderRadius: '30px',
    borderStyle: 'solid',
    borderColor: theme.palette.type === 'dark' ? '#313759' : '#ff0000',
    backgroundColor: theme.palette.type === 'dark' ? '#313759' : '#ff0000',
    height: 43,
    '&:hover': {
      borderColor: theme.palette.type === 'dark' ? '#3F466D' : '#ff0000',
      backgroundColor: theme.palette.type === 'dark' ? '#3F466D' : '#ff0000',
    },
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      margin: '10px 0 0 0',
    },
    [theme.breakpoints.down('sm')]: {
      minWidth: 'none',
    },
  },
  searchInput: {
    borderRadius: 8,
    height: '40px',
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
      lineHeight: '16px',
      color: theme.palette.text.secondary,
    },
    '& .MuiInputBase-root': {
      height: '100%',
    },
    [theme.breakpoints.down(725)]: {
      width: '100%',
    },
  },
  iconSearch: {
    borderRadius: 8,
  },
  checkboxes: {
    color: '#6B7199',
    '& .MuiSvgIcon-root': {
      color: '#6B7199',
    },
  },
  selectors: {
    display: 'flex',
    flexWrap: 'wrap',
    flexGrow: 1,
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
    [theme.breakpoints.down(725)]: {
      flexWrap: 'wrap',
      boxSizing: 'border-box',
    },
  },
  searchContainer: {
    alignItem: 'center',
    flexGrow: 1,
    height: 40,
    [theme.breakpoints.down(725)]: {
      flexGrow: 0,
      width: '100%',
      display: 'flex',
      justifyContent: 'normal',
      margin: '0 0 18px 0',
    },
  },
  toggleSwitchContainer: {
    backgroundColor: theme.palette.background.filters.inactive,
    borderRadius: '8px',
    marginRight: '10px',
    border: `2px solid ${theme.palette.background.filters.outline}`,
    width: '210px',
    [theme.breakpoints.down(725)]: {
      width: '100%',
      marginRight: '0',
      margin: '0 0 18px 0',
    },
  },
  toggleSwitchButton: {
    height: '40px',
    borderRadius: '8px',
    padding: '0 16px',
    margin: '0px 1px',
    textTransform: 'none',
    fontSize: '15px',
    fontWeight: 700,
    color: theme.palette.text.disabled,
    width: 'calc(50% - 2px)',
    whiteSpace: 'nowrap',
  },
  toggleSwitchButtonActive: {
    height: '40px',
    borderRadius: '8px',
    padding: '0 16px',
    margin: '0px 1px',
    textTransform: 'none',
    fontSize: '15px',
    fontWeight: 700,
    color: theme.palette.text.primary,
    backgroundColor: `${theme.palette.primary.main} !important`,
    width: 'calc(50% - 2px)',
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
    [theme.breakpoints.down(725)]: {
      width: '70%',
      display: 'flex',
      margin: '0 0 18px 0',
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
    [theme.breakpoints.down(700)]: {
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
});
