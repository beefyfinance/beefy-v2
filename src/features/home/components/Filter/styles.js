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
      height: '110px',
      borderRadius: '15px',
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
    opacity: 0.7,
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
    background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%)',
    backgroundColor: '#4771D1',
    '&:hover': {
      backgroundColor: '#628be8',
    },
  },
  bluechip: {
    background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%)',
    backgroundColor: '#073FAB',
    '&:hover': {
      backgroundColor: '#1054d4',
    },
  },
  beefy: {
    background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%)',
    backgroundColor: '#9D57F7',
    '&:hover': {
      backgroundColor: '#b576ff',
    },
  },
  low: {
    background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%)',
    backgroundColor: '#2E90A5',
    '&:hover': {
      backgroundColor: '#3eabc2',
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
    flexGrow: 1,
    [theme.breakpoints.down('sm')]: {
      flexGrow: 0,
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      margin: '10px 0',
    },
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
