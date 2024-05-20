import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  header: {
    [theme.breakpoints.up('sm')]: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    [theme.breakpoints.down('xs')]: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
      padding: '16px',
    },
  },
  card: {
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1px',
  },
  content: {
    padding: '0px',
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1px',
  },
  graphContainer: {
    backgroundColor: theme.palette.background.contentPrimary,
  },
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
  graph: {
    '& text': {
      ...theme.typography['subline-sm'],
      fill: theme.palette.text.dark,
    },
    '& .recharts-yAxis': {
      '& .recharts-cartesian-axis-tick': {
        opacity: 1,
        transition: 'ease-in-out 0.5s',
      },
    },
    '&:hover': {
      '& .recharts-yAxis': {
        '& .recharts-cartesian-axis-tick': {
          opacity: 0.5,
          transition: 'ease-in-out 0.5s',
        },
      },
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
