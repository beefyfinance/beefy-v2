import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alingItems: 'center',
    borderTop: '2px solid #363B63',
    padding: '16px 24px',
    borderRadius: '0px 0px 12px 12px',
    [theme.breakpoints.down('sm')]: {
      display: 'grid',
      rowGap: '16px',
    },
  },
  items: {
    display: 'flex',
    columnGap: '24px',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
      rowGap: '8px',
      order: 1,
      alignItems: 'flex-start',
    },
  },
  colorReference: {
    height: '2px',
    width: '12px',
  },
  legendItem: {
    ...theme.typography['subline-lg'],
    color: theme.palette.text.disabled,
    fontWeight: 700,
    display: 'flex',
    columnGap: '8px',
    alignItems: 'center',
  },
  tabsContainer: {
    '& .MuiTabs-root': {
      minHeight: '24px',
    },
    '& .MuiTab-root': {
      ...theme.typography['subline-lg'],
      minHeight: '22px',
    },
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      alignItems: 'flex-end',
    },
  },
});
