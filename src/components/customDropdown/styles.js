const styles = theme => ({
  select: {
    height: '44px',
    position: 'relative',
    '& .MuiSelect-select': {
      color: theme.palette.type === 'dark' ? '#6B7199' : '#ff0000',
      fontWeight: '600',
      padding: '11px 29px 0 15px',
      border: theme.palette.type === 'dark' ? '2px solid #313759' : '2px solid #ff0000',
      borderRadius: '30px',
      height: '29px',
      textAlign: 'right',
    },
    '& .MuiSelect-icon': {
      color: theme.palette.type === 'dark' ? '#6B7199' : '#ff0000',
      right: '8px',
    },
    '& .MuiTypography-root': {
      fontWeight: '600',
      color: theme.palette.type === 'dark' ? '#6B7199' : '#ff0000',
      position: 'absolute',
      top: '10px',
      left: '15px',
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
        margin: '0 5px',
      },
    },
  },
  withLabel: {
    minWidth: 200,
  },
  selectList: {
    color: theme.palette.type === 'dark' ? '#6B7199' : '#ff0000',
    border: theme.palette.type === 'dark' ? '2px solid #313759' : '2px solid #6B7199',
    backgroundColor: theme.palette.type === 'dark' ? '#1B203A' : '#faf6f1',
    padding: '0px',
    margin: '0px',
  },
});

export default styles;
