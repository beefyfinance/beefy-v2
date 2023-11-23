import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  vaultTags: {
    marginTop: '4px',
    display: 'flex',
    flexDirection: 'row' as const,
    flexWrap: 'nowrap' as const,
    columnGap: '8px',
    rowGap: '8px',
  },
  vaultTag: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.v2.button,
    padding: '2px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase' as const,
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
    '&:not(:first-child)': {
      flexShrink: 1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      minWidth: 0,
    },
  },
  vaultTagBoost: {
    backgroundColor: theme.palette.background.v2.tags.boost,
  },
  vaultTagRetired: {
    backgroundColor: theme.palette.background.v2.tags.retired,
  },
  vaultTagPaused: {
    backgroundColor: theme.palette.background.v2.tags.paused,
  },
  vaultTagEarn: {
    backgroundColor: theme.palette.background.v2.tags.earnings,
  },
});
