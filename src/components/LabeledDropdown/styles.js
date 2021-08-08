const styles = theme => ({
  container: {
    display: 'flex',
    '& .MuiSelect-icon': {
      color: theme.palette.type === 'dark' ? '#6B7199' : '#ff0000',
      // right: '8px',
    },
  },
  // selectList: {
  //   color: theme.palette.type === 'dark' ? '#6B7199' : '#ff0000',
  //   border: theme.palette.type === 'dark' ? '2px solid #313759' : '2px solid #6B7199',
  //   backgroundColor: theme.palette.type === 'dark' ? '#1B203A' : '#faf6f1',
  //   padding: '0px',
  //   margin: '0px',
  // },
  // select: {
  //   border: theme.palette.type === 'dark' ? '2px solid #313759' : '2px solid #ff0000',
  //   borderRadius: '30px',
  //   color: theme.palette.type === 'dark' ? '#6B7199' : '#ff0000',
  //   padding: '10px 29px 10px 15px',
  //   height: '44px',
  //   textAlign: 'right',
  //   '&:hover': {
  //     borderColor: theme.palette.type === 'dark' ? '#3F466D' : '#ff0000',
  //     color: theme.palette.type === 'dark' ? 'red' : '#ff0000',
  //   },
  //   [theme.breakpoints.down('md')]: {
  //     textAlign: 'left',
  //     margin: '0 5px',
  //   },
  // },
  // label: {
  //   color: 'white',
  //   fontWeight: '600',
  //   position: 'absolute',
  //   top: '10px',
  //   left: '15px',
  // },
  // value: {
  //   color: theme.palette.type === 'dark' ? '#6B7199' : '#ff0000',
  //   fontWeight: '600',
  // },
});

export default styles;
