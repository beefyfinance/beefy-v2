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
    color: theme.palette.text.secondary,
  },
  apy: {
    marginRight: '24px',
  },
  apyValue: {
    fontWeight: 700,
    color: theme.palette.text.secondary,
  },
  apyLabel: {
    fontSize: '12px',
    lineHeight: '20px',
    letterSpacing: '0.5px',
    color: theme.palette.text.disabled,
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
    color: theme.palette.text.secondary,
    marginBottom: '28px',
  },
});
