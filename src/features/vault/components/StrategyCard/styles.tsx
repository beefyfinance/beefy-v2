import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  cardActions: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    rowGap: '8px',
    columnGap: '8px',
    marginTop: theme.spacing(1),
  },
  cardAction: {},
  text: {
    margin: '0 0 32px 0',
    whiteSpace: 'pre-line' as const,
    color: theme.palette.text.secondary,
    '&:last-child': {
      marginBottom: 0,
    },
  },
  apysContainer: {
    marginBottom: '32px',
  },
  apyTitle: {
    ...theme.typography['h3'],
    color: theme.palette.text.secondary,
    marginBottom: '8px',
  },
  apys: {
    display: 'flex',
    columnGap: '32px',
    rowGap: '24px',
  },
  apy: {},
  apyLabel: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.disabled,
  },
  apyValue: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.secondary,
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
    color: theme.palette.text.secondary,
  },
});
