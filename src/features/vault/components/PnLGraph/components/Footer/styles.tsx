import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  footer: {
    display: 'flex',
    alingItems: 'center',
    padding: '24px',
    borderTop: '2px solid #363B63',
    borderRadius: '0px 0px 12px 12px',
    justifyContent: 'end',
    [theme.breakpoints.down('sm')]: {
      padding: '16px',
    },
  },
  tabsContainer: {
    '& .MuiTabs-root': {
      minHeight: '24px',
    },
    '& .MuiTab-root': {
      ...theme.typography['subline-lg'],
      minHeight: '22px',
      [theme.breakpoints.down('md')]: {
        paddingLeft: '12px',
        paddingRight: '0px',
      },
    },
    '& .MuiTabs-flexContainer': {
      [theme.breakpoints.down('md')]: {
        gap: '8px',
      },
    },
  },
});
