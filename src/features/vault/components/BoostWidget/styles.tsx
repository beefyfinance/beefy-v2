export const styles = theme => ({
  container: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
    borderRadius: '12px',
  },
  containerBoost: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.vaults.defaultOutline,
    borderRadius: '12px',
  },
  containerExpired: {
    padding: '24px',
    backgroundColor: theme.palette.background.default,
    borderRadius: '12px',
    marginTop: props => (props.isBoosted ? '-24px' : '0px'),
  },
  expiredBoostContainer: {
    background: theme.palette.background.vaults.defaultOutline,
    borderRadius: theme.spacing(1),
    padding: theme.spacing(2),
  },
  boostImg: {
    width: 30,
    height: 30,
    marginLeft: '-8px',
  },
  h1: {
    fontSize: '24px',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: '#E88225',
  },
  h1white: {
    fontSize: '24px',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: '#FFFFFF',
  },
  h2: {
    marginLeft: '1px',
    fontSize: '18px',
    lineHeight: '24px',
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: '16px',
  },
  countDown: {
    fontSize: '18px',
    lineHeight: '24px',
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: '16px',
  },
  body1: {
    fontSize: '12px',
    lineHeight: '20px',
    color: '#8585A6',
    fontWeight: '600',
    letterSpacing: '0.2px',
    textTransform: 'uppercase',
  },
  boostStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    rowGap: '16px',
    columnGap: '16px',
    margin: '20px 0 24px 0',
  },
  boostStat: {
    '& :last-child': {
      marginBottom: 0,
    },
  },
  button: {
    fontSize: '15px',
    fontWeight: 700,
    lineHeight: '24px',
    textTransform: 'none', //'capitalize' no good due to localization
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.default,
    padding: '12px 24px',
    borderRadius: '8px',
    '&.Mui-disabled': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    '& + $button': {
      marginTop: '12px',
    },
  },
  blockBtn: {
    marginLeft: 'auto',
    marginRight: '0',
    border: 'none',
    padding: 0,
    width: 32,
  },
  diffBG: {
    background: theme.palette.background.vaults.defaultOutline,
  },
});
