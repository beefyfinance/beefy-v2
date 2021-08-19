const styles = theme => ({
  btn: {
    color: theme.palette.type === 'dark' ? '#ffffff' : '#000000',
    fontWeight: '400',
    borderWidth: '2px',
    borderRadius: '30px',
    borderStyle: 'solid',
    padding: '5px 15px 5px',
    borderColor: theme.palette.type === 'dark' ? '#313759' : '#ff0000',
    backgroundColor: theme.palette.type === 'dark' ? '#313759' : '#ff0000',
    '&:hover': {
      borderColor: theme.palette.type === 'dark' ? '#3F466D' : '#ff0000',
      backgroundColor: theme.palette.type === 'dark' ? '#3F466D' : '#ff0000',
    },
    [theme.breakpoints.down('sm')]: {
      width: 300,
    },
  },
});

export default styles;
