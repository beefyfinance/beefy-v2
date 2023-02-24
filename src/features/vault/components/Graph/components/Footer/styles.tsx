import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alingItems: 'center',
    borderTop: '2px solid #363B63',
    padding: '24px',
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
    fontWeight: 700,
    color: theme.palette.text.disabled,
    display: 'grid',
    columnGap: '8px',
    alingItems: 'center',
    gridTemplateColumns: 'minmax(0,5%) minmax(0,95%)',
  },
  tabsContainer: {
    '& .MuiTabs-root': {
      minHeight: '38px',
    },
    '& .MuiTab-root': {
      minHeight: '34px',
    },
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      alignItems: 'flex-end',
    },
    [theme.breakpoints.up('sm')]: {
      marginTop: 0,
      marginLeft: 'auto',
    },
  },
  checkbox: {
    color: theme.palette.text.disabled,
  },
});
