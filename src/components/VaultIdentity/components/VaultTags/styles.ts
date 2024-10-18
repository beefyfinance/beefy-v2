import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  vaultTags: {
    marginTop: '4px',
    display: 'flex',
    flexDirection: 'row' as const,
    flexWrap: 'nowrap' as const,
    columnGap: '8px',
    rowGap: '8px',
    [theme.breakpoints.down(400)]: {
      flexWrap: 'wrap' as const,
    },
  },
  vaultTag: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.middle,
    backgroundColor: theme.palette.background.buttons.button,
    padding: '2px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase' as const,
    whiteSpace: 'nowrap' as const,
    display: 'flex',
    flexShrink: 0,
    '&:not(:first-child)': {
      flexShrink: 1,
      minWidth: 0,
      gap: '4px',
    },
  },
  vaultTagIcon: {
    flex: '0 0 auto',
  },
  vaultTagText: {
    flexShrink: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
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
  vaultTagEarn: {
    backgroundColor: theme.palette.background.tags.earnings,
  },
  vaultTagPoints: {
    backgroundColor: theme.palette.background.tags.earnings,
  },
  vaultTagRetired: {
    backgroundColor: theme.palette.background.tags.retired,
  },
  vaultTagPaused: {
    backgroundColor: theme.palette.background.tags.paused,
  },
  vaultTagClm: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: 700,
    backgroundColor: theme.palette.background.tags.clm,
    '& span': {
      fontWeight: 500,
    },
  },
  vaultTagClmIcon: {
    width: 16,
    height: 16,
    display: 'block',
  },
  vaultTagClmText: {},
  vaultTagClmAutoHide: {
    '& $vaultTagClmText': {
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
  },
  platformTagGov: {
    backgroundColor: theme.palette.background.tags.platformGov,
  },
  platformTagClm: {
    backgroundColor: theme.palette.background.tags.platformClm,
  },
  divider: {
    height: '8px',
    width: '1px',
    borderRadius: '8px',
    backgroundColor: '#D9D9D94C',
  },
  flexWrap: {
    flexWrap: 'wrap' as const,
  },
});
