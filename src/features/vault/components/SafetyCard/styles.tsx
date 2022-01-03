const defaultFont = {
  fontFamily: 'Proxima Nova',
  fontStyle: 'normal',
};

const boldFont = {
  ...defaultFont,
  fontWeight: 600,
};

export const styles = theme => ({
  cardSubtitle: {
    fontSize: '18px',
    lineHeight: '24px',
    color: '#8585A6',
    letterSpacing: '0.2px',
  },
  riskList: {
    marginBottom: '12px',
  },
  riskRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '18px',
  },
  risk: {
    color: theme.palette.text.secondary,
    marginRight: 8,
  },
  riskCategory: {
    color: theme.palette.text.disabled,
  },
  infoContainer: {
    display: 'flex',
    alignItems: 'flex-start',
  },
  moreInfoContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  moreInfoLabel: {
    ...boldFont,
    marginRight: '5px',
    fontSize: '14px',
    lineHeight: '24px',
    letterSpacing: '0.2px',
    color: '#6B7199',
  },
  notes: {
    '& p': {
      color: theme.palette.text.secondary,
    },
    '& p:first-child': {
      marginBottom: '12px',
    },
  },
  arrow: {
    marginTop: '5px',
    marginRight: '8px',
  },
  tooltipLabel: {
    display: 'flex',
    alignItems: 'center',
  },
  safetyLabel: {
    whiteSpace: 'nowrap',
    fontWeight: 400,
    color: theme.palette.text.disabled,
    textTransform: 'none', //'capitalize' no good due to localization
    textAlign: 'left',
  },
  tooltipHolder: {
    marginLeft: theme.spacing(0.5),
  },
});
