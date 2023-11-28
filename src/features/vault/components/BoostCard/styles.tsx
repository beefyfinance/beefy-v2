import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  text: {
    color: theme.palette.text.middle,
    marginBottom: '24px',
  },
  boostedBy: {
    ...theme.typography['h2'],
    color: theme.palette.background.vaults.boost,
    flexGrow: 1,
    '& span': {
      color: theme.palette.text.light,
    },
  },
  header: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    rowGap: '16px',
    padding: '24px',
    borderRadius: '12px 12px 0 0',
    backgroundColor: theme.palette.background.cardHeader,
  },
  socials: {
    display: 'flex',
    columnGap: '8px',
    rowGap: '8px',
    flexWrap: 'wrap' as const,
  },
});
