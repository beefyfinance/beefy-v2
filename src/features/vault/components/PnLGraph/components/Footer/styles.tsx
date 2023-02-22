import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alingItems: 'center',
    borderTop: '2px solid #363B63',
    padding: '24px',
    borderRadius: '0px 0px 12px 12px',
    [theme.breakpoints.down('md')]: {
      padding: '16px',
    },
  },
  items: {
    display: 'flex',
    columnGap: '24px',
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
      display: 'block',
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
    alignItems: 'center',
    gridTemplateColumns: 'minmax(0,5%) minmax(0,95%)',
  },
  tabsContainer: {
    marginTop: 10,
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
});
