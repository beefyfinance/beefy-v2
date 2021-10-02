const styles = theme => ({
  categories: {
    paddingBottom: '40px',
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
      width: 375,
    },
    [theme.breakpoints.down('sm')]: {
      width: 300,
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
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      justifyContent: 'center',
      margin: '10px 0',
    },
  },
  lblShowing: {
    textAlign: 'right',
    minWidth: 100,
    flexGrow: 1,
    [theme.breakpoints.up('sm')]: { minWidth: 200 },
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
    [theme.breakpoints.down('sm')]: {
      width: 300,
    },
  },
  searchInput: {
    borderRadius: 30,
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
  },
  iconSearch: {
    marginLeft: '-2rem',
    marginTop: '8.5px',
  },
  btnClearSearch: {
    borderRadius: 30,
    color: '#484F7F',
    fontWeight: 'bold',
    marginLeft: '-4rem',
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
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'center',
    },
  },
  selector: {
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      marginRight: 0,
    },
  },
  filtersContainer: {
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      display: 'block',
    },
  },
  searchContainer: {
    display: 'flex',
    alignItem: 'center',
    flexGrow: 1,
    [theme.breakpoints.down('sm')]: {
      flexGrow: 0,
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      margin: '10px 0',
    },
  },
  toggleSwitchContainer: {
    backgroundColor: '#14182B',
    borderRadius: '20px',
    marginRight: '10px',
  },
  toggleSwitchButton: {
    height: '44px',
    borderRadius: '20px',
    padding: '0 16px',
    textTransform: 'none',
    fontSize: '16px',
    color: '#484F7F',
  },
  toggleSwitchButtonActive: {
    height: '44px',
    borderRadius: '20px',
    padding: '0 16px',
    textTransform: 'none',
    fontSize: '16px',
    color: '#FFFFFF',
    backgroundColor: '#434B7A',
    fontWeight: '600',
  },
  filterIcon: {
    marginRight: '8px',
  },
  sortByContainer: {
    marginRight: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      margin: '10px 0',
    },
  },
  blockBtn: {
    [theme.breakpoints.down('sm')]: {
      width: 300,
    },
  },
});

export default styles;
