import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  otherRewards: {
    borderTop: `1px solid ${theme.palette.background.contentPrimary}`,
  },
  otherRewardsToggle: {
    ...theme.typography['subline-sm'],
    padding: '8px 0 0 0',
    border: 0,
    margin: 0,
    boxShadow: 'none',
    background: 'transparent',
    color: theme.palette.text.dark,
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left' as const,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  otherRewardsList: {
    paddingTop: '12px',
  },
  otherRewardsToggleIcon: {
    width: '16.43px',
    height: '9.41px',
  },
});
