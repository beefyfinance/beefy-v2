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
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    rowGap: '8px',
    columnGap: '8px',
    marginLeft: 'auto',
    [theme.breakpoints.down('sm')]: {
      marginLeft: '0',
    },
  },
  campaignTitle: {
    ...theme.typography['h3'],
  },
  campaignText: {
    color: theme.palette.text.middle,
  },
  partners: {},
  partnerSubCard: {
    borderRadius: '12px',
    backgroundColor: theme.palette.background.contentLight,
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
  content: {
    rowGap: '16px',
  },
});
