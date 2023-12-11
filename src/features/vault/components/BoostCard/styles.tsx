import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  text: {
    color: theme.palette.text.middle,
    marginBottom: '16px',
  },
  boostedBy: {
    ...theme.typography['h2'],
    margin: 0,
    color: theme.palette.background.vaults.boost,
    flexGrow: 1,
    '& span': {
      color: theme.palette.text.light,
    },
  },
  header: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '16px',
    padding: '24px',
    borderRadius: '12px 12px 0 0',
    backgroundColor: theme.palette.background.contentDark,
  },
  socials: {
    display: 'flex',
    columnGap: '8px',
    rowGap: '8px',
    flexWrap: 'wrap' as const,
  },
  campaignTitle: {
    ...theme.typography['h3'],
    margin: '0 0 16px 0',
  },
  campaignText: {},
  partners: {
    marginTop: '24px',
  },
  partnerSubCard: {
    borderRadius: '12px',
    backgroundColor: theme.palette.background.contentLight,
    '& + $partnerSubCard': {
      marginTop: '24px',
    },
  },
  partnerHeader: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '16px',
    padding: '16px',
    borderRadius: '12px 12px 0 0',
    backgroundColor: theme.palette.background.contentDark,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partnerContent: {
    padding: '16px',
  },
  partnerTitle: {
    ...theme.typography['h3'],
    margin: 0,
  },
  partnerText: {},
  rewardToken: {
    marginTop: '24px',
  },
});
