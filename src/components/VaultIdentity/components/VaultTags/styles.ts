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
    color: theme.palette.text.middle,
    backgroundColor: theme.palette.background.buttons.button,
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
    backgroundColor: theme.palette.background.tags.boost,
  },
  vaultTagBoostIcon: {
    width: '12px',
    height: '20px',
    padding: '4px 0',
    marginRight: '4px',
    verticalAlign: 'bottom',
  },
  vaultTagRetired: {
    backgroundColor: theme.palette.background.tags.retired,
  },
  vaultTagPaused: {
    backgroundColor: theme.palette.background.tags.paused,
  },
  vaultTagEarn: {
    backgroundColor: theme.palette.background.tags.earnings,
  },
  vaultTagPoints: {
    backgroundColor: theme.palette.background.tags.earnings,
  },
  vaultTagClm: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: theme.palette.background.tags.clm,
  },
  platformTagGov: {
    backgroundColor: theme.palette.background.tags.platformGov,
  },
  platformTagClm: {
    backgroundColor: theme.palette.background.tags.platformClm,
  },
});
