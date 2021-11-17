export const styles = theme => ({
  container: {
    height: '44px',
    position: 'relative',
    '& .MuiSelect-select': {
      color: theme.palette.type === 'dark' ? '#6B7199' : '#ff0000',
      fontWeight: '600',
      fontSize: 18,
      padding: '11px 29px 0 15px',
      border: theme.palette.type === 'dark' ? '2px solid #313759' : '2px solid #ff0000',
      borderRadius: '30px',
      height: '29px',
      textAlign: 'right',
      [theme.breakpoints.up('md')]: {
        minWidth: '200px',
      },
    },
    '& .MuiSelect-icon': {
      color: theme.palette.type === 'dark' ? '#6B7199' : '#ff0000',
      right: '8px',
    },
    '& .MuiTypography-root': {
      fontWeight: '600',
      color: theme.palette.type === 'dark' ? 'white' : '#ff0000',
      position: 'absolute',
      top: '10px',
      left: '23px',
    },
    '&:hover': {
      borderColor: theme.palette.type === 'dark' ? '#3F466D' : '#ff0000',
    },
    '&:hover .MuiSelect-select': {
      color: theme.palette.type === 'dark' ? '#8585A6' : '#ff0000',
    },
    [theme.breakpoints.down('md')]: {
      '& .MuiSelect-select': {
        textAlign: 'left',
      },
    },
  },
  select: {
    minWidth: 210,
    [theme.breakpoints.down('sm')]: {
      minWidth: 'none',
    },
  },
  selectList: {
    color: theme.palette.type === 'dark' ? '#6B7199' : '#ff0000',
    border: theme.palette.type === 'dark' ? '2px solid #313759' : '2px solid #6B7199',
    backgroundColor: theme.palette.type === 'dark' ? '#1B203A' : '#faf6f1',
    padding: '0px',
    margin: '0px',
    '& .label': {
      display: 'none',
    },
  },
  label: {
    color: '#6B7199',
  },
});
