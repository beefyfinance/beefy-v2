const styles = theme => ({
  tags: {
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.5px',
    padding: '3px 9px',
    borderRadius: '5px',
    margin: '2px 3px',
    textTransform: 'uppercase',
    color: '#FFF',
    [theme.breakpoints.down('md')]: {
      wordBreak: 'none',
      letterSpacing: '0.2px',
      fontSize: '10px',
    },
  },
  lowTag: {
    backgroundColor: '#2E90A5',
  },
  beefyTag: {
    backgroundColor: '#9D57F7',
  },
  boostTag: {
    backgroundColor: '#E88225',
  },
  stableTag: {
    backgroundColor: '#57A1F7',
  },
  bluechipTag: {
    backgroundColor: '#073FAB',
  },
  'deposits-pausedTag': {
    backgroundColor: '#000000',
    letterSpacing: '0.15px',
    padding: '3px 5px',
  },
  eolTag: {
    backgroundColor: '#000000',
  },
  pausedTag: {
    backgroundColor: '#484F7F',
  },
  spacingMobile: {
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      justifyContent: 'center',
      padding: '5px 0',
    },
  },
});

export default styles;
