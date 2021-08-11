const styles = theme => ({
  container: {},
  tabs: {
    backgroundColor: '#14182B',
    borderRadius: 40,
    '& .MuiTabs-indicator': {
      display: 'none',
      color: 'transparent',
    },
    '& .MuiTab-root': {
      minWidth: 70,
    },
    '& .MuiTab-textColorPrimary': {
      fontWeight: 600,
      letterSpacing: 0.2,
      color: '#484F7F',
    },
    '& .Mui-selected': {
      backgroundColor: '#484F7F',
      borderRadius: 40,
      color: 'white',
      border: '3px solid #14182B',
      padding: '5px',
    },
  },
});

export default styles;
