const styles = theme => ({
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
    color: '#fff',
    fontSize: '18px',
    fontWeight: '600',
    height: '24px',
    textAlign: 'center',
    textTransform: 'none', //'capitalize' no good due to localization
    transition: 'opacity 0.2s ease-in-out',
  },
  selected: {
    border: 'solid 3px #3F466D',
    backgroundColor: '#272B4A',
    '& .MuiSvgIcon-root': {
      fontSize: '80px',
      position: 'absolute',
      bottom: -45,
      color: '#272B4A',
    },
  },
  all: {
    background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%)',
    backgroundColor: '#505679',
    '&:hover': {
      backgroundColor: '#6f76a0',
    },
  },
  stable: {
    background: '#3D8F61',
    backgroundColor: '#3D8F61',
    '&:hover': {
      backgroundColor: '#5EBA87',
    },
  },
  bluechip: {
    background: '#3E5FA7',
    backgroundColor: '#3E5FA7',
    '&:hover': {
      backgroundColor: '#6A88C8',
    },
  },
  beefy: {
    background: '#5C499D',
    backgroundColor: '#5C499D',
    '&:hover': {
      backgroundColor: '#8574BE',
    },
  },
  low: {
    background: '#639CBF',
    backgroundColor: '#639CBF',
    '&:hover': {
      backgroundColor: '#76A7C6',
    },
  },
  input: {
    fontSize: '18px',
    fontWeight: '600',
    borderWidth: '2px',
    borderRadius: '30px',
    width: 150,
    [theme.breakpoints.up('sm')]: {
      width: 250,
    },
    [theme.breakpoints.up('md')]: {
      width: 370,
    },
    [theme.breakpoints.down('sm')]: {
      width: 200,
    },
    [theme.breakpoints.down(775)]: {
      width: 150,
    },
    [theme.breakpoints.down(725)]: {
      width: '100%',
    },
  },
  filters: {
    borderColor: theme.palette.type === 'dark' ? '#484F7F' : '#ff0000',
    borderWidth: '2px',
    borderRadius: '30px',
    borderStyle: 'solid',
    backgroundColor: '#14182B',
    marginTop: 20,
    padding: theme.spacing(2),
  },
  btnFilter: {
    '& .MuiToggleButton-root': {
      textTransform: 'none',
      color: theme.palette.type === 'dark' ? '#ffffff' : '#000000',
      fontSize: '18px',
      fontWeight: '600',
      borderWidth: '2px',
      borderRadius: '30px',
      borderStyle: 'solid',
      padding: '10px 23px',
      borderColor: theme.palette.type === 'dark' ? '#313759' : '#ff0000',
      backgroundColor: theme.palette.type === 'dark' ? '#313759' : '#ff0000',
      height: 43,
      '& .MuiSvgIcon-root': {
        fontSize: '70px',
        position: 'absolute',
        bottom: -40,
        color: '#6B7199',
      },
      '&:hover': {
        borderColor: theme.palette.type === 'dark' ? '#3F466D' : '#ff0000',
        backgroundColor: theme.palette.type === 'dark' ? '#3F466D' : '#ff0000',
        '& .MuiSvgIcon-root': {
          color: '#3F466D',
        },
      },
    },
    '& .Mui-selected': {
      borderColor: theme.palette.type === 'dark' ? '#6B7199' : '#ff0000',
      backgroundColor: theme.palette.type === 'dark' ? '#6B7199' : '#ff0000',
    },
    [theme.breakpoints.down(725)]: {
      display: 'flex',
      width: '40%',
      margin: '0 0 18px 0',
    },
  },
  btnResetContainer: {
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  lblShowing: {
    textAlign: 'right',
    minWidth: 100,
    flexGrow: 1,
    [theme.breakpoints.up('xs')]: { minWidth: 200 },
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
      minWidth: '310px',
    },
  },
  searchInput: {
    borderRadius: 30,
    height: '44px',
    position: 'relative',
    color: '#484F7F',
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        border: '2px solid #484F7F',
      },
      '&:hover fieldset': {
        border: '2px solid #484F7F',
      },
      '&.Mui-focused fieldset': {
        border: '2px solid #484F7F',
      },
    },
    '& .MuiFormLabel-root': {
      fontSize: 18,
      color: '#484F7F',
    },
    '&:hover': {
      '& .MuiFormLabel-root': {
        color: '#6B7199',
      },
    },
    '& .MuiInputBase-root': {
      height: '100%',
    },
    [theme.breakpoints.down(725)]: {
      width: '100%',
    },
  },
  iconSearch: {
    marginLeft: '-44px',
    marginTop: '10px',
  },
  btnClearSearch: {
    borderRadius: 30,
    color: '#484F7F',
    fontWeight: 'bold',
    marginLeft: '-4rem',
    position: 'absolute',
    padding: '10px',
    '&:hover': {
      background: 'none',
    },
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
    [theme.breakpoints.down(725)]: {
      flexGrow: 0,
      width: '100%',
      display: 'flex',
      justifyContent: 'normal',
      margin: '0 0 18px 0',
    },
  },
  toggleSwitchContainer: {
    backgroundColor: '#14182B',
    borderRadius: '22px',
    marginRight: '10px',
    width: '204px',
    [theme.breakpoints.down(725)]: {
      width: '100%',
      marginRight: '0',
      order: '5',
      margin: '0 0 18px 0',
    },
  },
  toggleSwitchButton: {
    height: '40px',
    borderRadius: '20px',
    padding: '0 16px',
    margin: '2px 2px',
    textTransform: 'none',
    fontSize: '16px',
    color: '#484F7F',
    [theme.breakpoints.down(725)]: {
      width: 'calc(50% - 4px)',
    },
  },
  toggleSwitchButtonActive: {
    height: '40px',
    borderRadius: '20px',
    padding: '0 16px',
    margin: '2px 2px',
    textTransform: 'none',
    fontSize: '16px',
    color: '#FFFFFF',
    backgroundColor: '#434B7A !important',
    fontWeight: '600',
    [theme.breakpoints.down(725)]: {
      width: 'calc(50% - 4px)',
    },
  },
  filterIcon: {
    marginRight: '8px',
  },
  sortByContainer: {
    marginRight: theme.spacing(1),
    '& .MuiBox-root': {
      width: '100%',
    },
    [theme.breakpoints.up('sm')]: {
      width: '170px',
    },
    [theme.breakpoints.down(725)]: {
      width: '60%',
      display: 'flex',
      margin: '0 0 18px 0',
      paddingRight: '16px',
    },
  },
  blockBtn: {
    [theme.breakpoints.down(725)]: {
      width: '100%',
    },
  },
  filtersSlider: {
    '& div': {
      height: '60px',
    },
  },
  filterItem: {
    margin: '0px 4px',
    width: 'calc(20% - 8px) !important',
  },
  boostFilterLabel: {
    display: 'flex',
  },
  checkboxContainer: {
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
});

export default styles;
