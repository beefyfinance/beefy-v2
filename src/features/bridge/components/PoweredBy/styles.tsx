import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  poweredBy: {},
  poweredByLabel: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.dark,
  },
  poweredByLogos: {
    marginTop: '16px',
    display: 'flex',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    gap: '24px',
  },
});
