import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  header: {
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
      rowGap: '16px',
    },
  },
  cardActions: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    rowGap: '8px',
    columnGap: '8px',
    marginLeft: 'auto',
    [theme.breakpoints.down('sm')]: {
      marginLeft: '0',
    },
  },
  cardAction: {},
  text: {
    margin: '0 0 32px 0',
    whiteSpace: 'pre-line' as const,
    color: theme.palette.text.middle,
    '&:last-child': {
      marginBottom: 0,
    },
  },
  apysContainer: {},
  apyTitle: {
    ...theme.typography['h3'],
    color: theme.palette.text.middle,
    marginBottom: '8px',
  },
  apys: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '12px 32px',
  },
  apy: {},
  apyLabel: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.dark,
  },
  apyValue: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.middle,
  },
  audits: {
    display: 'flex',
    columnGap: '56px',
    rowGap: '24px',
  },
  audit: {
    display: 'flex',
  },
  auditIcon: {
    marginRight: '8px',
  },
  auditLabel: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.middle,
  },
  detailsLink: {
    color: theme.palette.text.middle,
  },
});
