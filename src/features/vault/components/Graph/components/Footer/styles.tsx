import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alingItems: 'center',
    borderTop: '2px solid #363B63',
    padding: '8px 24px',
    borderRadius: '0px 0px 12px 12px',
    [theme.breakpoints.down('sm')]: {
      padding: '8px 16px',
    },
    [theme.breakpoints.down('xs')]: {
      display: 'grid',
    },
  },
  items: {
    display: 'flex',
    columnGap: '24px',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
      rowGap: '8px',
      alignItems: 'flex-start',
    },
    [theme.breakpoints.down('xs')]: {
      order: 1,
    },
  },
  colorReference: {
    height: '2px',
    width: '12px',
  },
  legendItem: {
    ...theme.typography['subline-lg'],
    fontWeight: 700,
    color: theme.palette.text.disabled,
    display: 'flex',
    columnGap: '8px',
    alingItems: 'center',
  },
  tabsContainer: {
    display: 'flex',
    alignItems: 'center',
    '& .MuiTabs-root': {
      minHeight: '24px',
    },
    '& .MuiTab-root': {
      ...theme.typography['subline-lg'],
      minHeight: '22px',
      padding: '6px 0px',
      [theme.breakpoints.down('md')]: {
        display: 'flex',
        alignItems: 'flex-end',
      },
    },
    '& .MuiTabs-flexContainer': {
      gap: '12px',
    },
  },
  checkbox: {
    color: theme.palette.text.disabled,
  },
});
