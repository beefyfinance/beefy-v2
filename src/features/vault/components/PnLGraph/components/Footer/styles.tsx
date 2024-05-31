import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  footer: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 24px',
    borderTop: `2px solid ${theme.palette.background.border}`,
    borderRadius: '0px 0px 12px 12px',
    justifyContent: 'end',
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
      padding: '6px 0px',
    },
    '& .MuiTabs-flexContainer': {
      gap: '12px',
    },
  },
});
