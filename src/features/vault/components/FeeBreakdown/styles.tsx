const regularText = {
  fontSize: '14px',
  fontWeight: 400,
  color: '#8585A6',
  letterSpacing: '0.2px',
};

export const styles = theme => ({
  feeContainer: {
    backgroundColor: theme.palette.background.light,
    borderRadius: '10px',
  },
  title: {
    fontSize: '16px',
    lineHeight: '18px',
    fontWeight: 600,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    color: '#8585A6',
  },
  value: {
    fontSize: '18px',
    fontWeight: 600,
    letterSpacing: '0.2px',
    color: '#ffffff',
    paddingTop: '0',
  },
  label: {
    ...regularText,
    paddingTop: 5,
    fontSize: '12px',
    fontWeight: 600,
    lineHeight: '20px',
    textTransform: 'uppercase',
  },
  text: {
    ...regularText,
    paddingTop: 5,
    fontSize: '14px',
    lineHeight: '18px',
  },
  divider: {
    margin: '20px 0',
    color: '#8585A6',
  },
  feeBreakdownBlock: {
    marginBottom: 10,
  },
  feeBreakdownBold: {
    fontSize: 18,
  },
  feeBreakdownDetail: {
    ...regularText,
  },
  feeBreakdownDetailPerf: {
    ...regularText,
    whiteSpace: 'pre',
    tabSize: 10,
  },
  zapStep: {
    fontSize: '14px',
    lineHeight: '18px',
    marginBottom: '12px',
  },
  // eslint-disable-next-line no-dupe-keys
  divider: {
    height: '2px',
    marginBottom: '20px',
    marginTop: '8px',
  },
  flexAlignCenter: {
    display: 'flex',
    alignItems: 'baseline',
  },
  ol: {
    paddingLeft: 14,
  },
  labelTooltip: {
    fontWeight: 400,
    fontSize: '14px',
    lineHeight: '18px',
    color: theme.palette.type === 'dark' ? '#565B81' : '#A69885',
    letterSpacing: '0.2px',
    textTransform: 'none', //'capitalize' no good due to localization
    textAlign: 'left',
  },
  valueTooltip: {
    fontWeight: 400,
    fontSize: '14px',
    lineHeight: '18px',
    color: theme.palette.type === 'dark' ? '#565B81' : '#A69885',
    letterSpacing: '0.2px',
    textTransform: 'none', //'capitalize' no good due to localization
    textAlign: 'rigth',
  },
  bold: {
    fontWeight: 'bold',
    fontSize: '14px',
    lineHeight: '18px',
    color: theme.palette.type === 'dark' ? '#272B4A' : '#A69885',
    letterSpacing: '0.2px',
    textTransform: 'none',
  },
  rows: {
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    '& div': {
      margin: '5px 0px',
    },
  },
});
