import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  footer: {
    display: 'flex',
    flexWrap: 'nowrap' as const,
    gap: '16px',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    borderRadius: '0px 0px 12px 12px',
    backgroundColor: theme.palette.background.contentPrimary,
    [theme.breakpoints.down('sm')]: {
      padding: '8px 16px',
    },
  },
  legendContainer: {
    ...theme.typography['body-lg-med'],
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    color: theme.palette.text.dark,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  usdReferenceLine: {
    height: '2px',
    width: '12px',
    backgroundColor: '#606FCF',
    borderRadius: '4px',
  },
  token1ReferenceLine: {
    height: '2px',
    width: '12px',
    backgroundColor: theme.palette.background.cta,
    borderRadius: '4px',
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
