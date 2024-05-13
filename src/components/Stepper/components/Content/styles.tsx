import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  successContent: {
    backgroundColor: 'rgba(89, 166, 98, 0.15)',
  },
  errorContent: {
    backgroundColor: 'rgba(219, 50, 50, 0.1)',
    whiteSpace: 'pre-wrap',
    overflowY: 'auto',
  },
  content: {
    marginTop: '12px',
    padding: '16px',
    borderRadius: '4px',
  },
  message: {
    color: theme.palette.background.txsModal.text,
    '& span': {
      fontWeight: theme.typography['body-lg-med'].fontWeight,
    },
  },
  messageHighlight: {
    color: theme.palette.background.txsModal.text,
    fontWeight: theme.typography['body-lg-med'].fontWeight,
    '$message + &': {
      marginTop: '16px',
    },
  },
  friendlyMessage: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.background.txsModal.text,
    marginBottom: '16px',
  },
  closeBtn: {},
  rememberContainer: {
    marginTop: '16px',
  },
  dustContainer: {
    marginTop: '16px',
  },
  icon: {
    height: '20px',
    marginRight: '8px',
  },
  buttons: {
    display: 'grid',
    gridAutoFlow: 'column',
    gridAutoColumns: '1fr',
    width: '100%',
    alignItems: 'center',
    gap: '8px',
    marginTop: '24px',
  },
  link: {
    textDecoration: 'none',
    color: theme.palette.primary.main,
  },
});
