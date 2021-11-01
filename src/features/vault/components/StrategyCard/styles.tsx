const defaultFont = {
  fontFamily: 'Proxima Nova',
  fontStyle: 'normal',
};

const bold = {
  ...defaultFont,
  fontWeight: 600,
};

export const styles = theme => ({
  cardActions: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  cardAction: {
    marginRight: '15px',
  },
  apysContainer: {
    marginBottom: '32px',
  },
  apys: {
    display: 'flex',
  },
  apyTitle: {
    ...bold,
    fontSize: '16px',
    lineHeight: '24px',
    marginBottom: '12px',
    fontWeight: '700',
  },
  apy: {
    marginRight: '24px',
  },
  apyValue: {
    ...bold,
    fontSize: '18px',
    lineHeight: '24px',
  },
  apyLabel: {
    ...defaultFont,
    fontSize: '12px',
    lineHeight: '20px',
    letterSpacing: '0.2px',
    color: '#8585A6',
  },
  audits: {
    display: 'flex',
  },
  audit: {
    display: 'flex',
    marginRight: '50px',
    color: 'white',
  },
  auditIcon: {
    marginRight: '10px',
  },
  auditLabel: {
    ...bold,
  },
  text: {
    fontFamily: 'Proxima Nova',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '16px',
    lineHeight: '24px',
    marginBottom: '28px',
  },
});