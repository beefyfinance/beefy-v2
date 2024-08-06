import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  footer: {
    display: 'flex',
    flexWrap: 'nowrap' as const,
    gap: '16px',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: '12px 24px',
    borderRadius: '0px 0px 12px 12px',
    backgroundColor: theme.palette.background.contentPrimary,
    [theme.breakpoints.down('sm')]: {
      padding: '8px 16px',
    },
  },
  tabsContainer: {
    '& .MuiTabs-root': {
      minHeight: '24px',
    },
    '& .MuiTab-root': {
      ...theme.typography['subline-lg'],
      minHeight: '22px',
      padding: '0px',
    },
    '& .MuiTabs-flexContainer': {
      gap: '12px',
    },
  },
});
