export const styles = theme => ({
  tags: {
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.5px',
    padding: '3px 8px',
    borderRadius: '5px',
    margin: '2px 0 0 6px',
    textTransform: 'uppercase',
    color: '#FFF',
    [theme.breakpoints.down('md')]: {
      wordBreak: 'none',
      letterSpacing: '0.2px',
      fontSize: '10px',
    },
  },
  lowTag: {
    backgroundColor: theme.palette.background.tags.lowRisk,
  },
  beefyTag: {
    backgroundColor: theme.palette.background.tags.bifi,
  },
  boostTag: {
    backgroundColor: theme.palette.background.tags.boost,
  },
  stableTag: {
    backgroundColor: theme.palette.background.tags.stable,
  },
  bluechipTag: {
    backgroundColor: theme.palette.background.tags.blueChip,
  },
  'deposits-pausedTag': {
    backgroundColor: theme.palette.background.tags.eol,
    letterSpacing: '0.15px',
    padding: '3px 5px',
  },
  eolTag: {
    backgroundColor: theme.palette.background.tags.eol,
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
