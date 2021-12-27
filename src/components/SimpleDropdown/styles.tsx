export const styles = theme => ({
  select: {
    marginLeft: '24px',
    [theme.breakpoints.down('lg')]: {
      marginLeft: 0,
    },
    '& .MuiSelect-select': {
      color: theme.palette.text.disabled,
      fontWeight: 700,
      fontSize: 15,
      padding: '12px 30px 0px 15px',
      [theme.breakpoints.down('md')]: {
        padding: '12px 30px 0px 11px',
      },
      border: props =>
        props.noBorder
          ? 'none'
          : theme.palette.type === 'dark'
          ? '2px solid #313759'
          : '2px solid #ff0000',
      borderRadius: '8px',
      height: '29px',
      textAlign: 'right',
      display: 'flex',
      '& img': {
        height: '18px',
        marginRight: '5px',
      },
    },
    '& .MuiSelect-icon': {
      color: theme.palette.text.disabled,
      right: '8px',
    },
    '& .MuiTypography-root': {
      color: theme.palette.text.disabled,
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
  selectList: {
    color: theme.palette.type === 'dark' ? '#6B7199' : '#ff0000',
    border: theme.palette.type === 'dark' ? '2px solid #313759' : '2px solid #6B7199',
    backgroundColor: theme.palette.type === 'dark' ? '#1B203A' : '#faf6f1',
    padding: '0px',
    margin: '0px',
    '& img': {
      height: '24px',
      marginRight: '5px',
    },
  },
});
