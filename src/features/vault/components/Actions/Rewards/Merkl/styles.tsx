import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    padding: 24,
    borderRadius: '12px',
    backgroundColor: theme.palette.background.contentPrimary,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  title: {
    ...theme.typography.h2,
    color: theme.palette.text.light,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  titleLogo: {
    display: 'block',
    height: '32px',
    width: '32px',
  },
  description: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.dark,
  },
  rewards: {
    backgroundColor: theme.palette.background.contentLight,
    borderRadius: '8px',
  },
  otherRewardsOpen: {},
  otherRewards: {
    borderTop: `1px solid ${theme.palette.background.contentPrimary}`,
  },
  otherRewardsToggle: {
    ...theme.typography['subline-sm'],
    padding: '12px',
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
    '$otherRewardsOpen &': {
      padding: '12px 12px 0 12px',
      margin: `0 0 ${4 - 12}px 0`,
    },
  },
  otherRewardsToggleIcon: {
    width: '16.43px',
    height: '9.41px',
  },
});
