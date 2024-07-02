import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
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
  oracleLink: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.middle,
    textDecoration: 'none' as const,
    '&:hover': {
      cursor: 'pointer' as const,
    },
  },
});
