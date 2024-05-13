import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1px',
  },
  graph: {
    backgroundColor: theme.palette.background.contentPrimary,
  },
  footer: {
    display: 'flex',
    flexWrap: 'nowrap' as const,
    gap: '16px',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderRadius: '0px 0px 12px 12px',
    backgroundColor: theme.palette.background.contentPrimary,
    [theme.breakpoints.down('sm')]: {
      padding: '8px 16px',
    },
  },

  legend: {
    display: 'flex',
    gap: '24px',
  },
  legendItem: {
    ...theme.typography['subline-lg'],
    color: theme.palette.text.dark,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  line: {
    height: '2px',
    width: '12px',
    backgroundColor: '#FFF',
  },
  range: {
    height: '12px',
    width: '12px',
    backgroundColor: '#3F446E',
  },
});
