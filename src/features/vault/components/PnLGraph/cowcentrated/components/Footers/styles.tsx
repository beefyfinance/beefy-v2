import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  footer: {
    display: 'flex',
    flexWrap: 'nowrap' as const,
    gap: '8px 16px',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    borderRadius: '0px 0px 12px 12px',
    backgroundColor: theme.palette.background.contentPrimary,
    [theme.breakpoints.down('sm')]: {
      padding: '8px 16px',
      flexWrap: 'wrap' as const,
    },
  },
  legendContainer: {
    ...theme.typography['body-sm-med'],
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    color: theme.palette.text.dark,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    [theme.breakpoints.down('xs')]: {
      flexWrap: 'wrap' as const,
    },
  },
  legendItem: {
    display: 'flex',
    flexWrap: 'nowrap' as const,
    alignItems: 'center',
    gap: '8px',
  },
  positionReferenceLine: {
    height: '2px',
    width: '12px',
    backgroundColor: '#4DB258',
    borderRadius: '4px',
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
  holdReferenceLine: {
    height: '2px',
    width: '12px',
    backgroundColor: theme.palette.text.dark,
    borderRadius: '4px',
  },
  tabsContainer: {
    '& .MuiTabs-root': {
      minHeight: '24px',
    },
    '& .MuiTab-root': {
      ...theme.typography['body-sm-med'],
      minHeight: '22px',
      padding: '0px',
    },
    '& .MuiTabs-flexContainer': {
      gap: '12px',
    },
  },
});
