import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  footer: {
    display: 'flex',
    alingItems: 'center',
    padding: '16px 24px',
    borderTop: '2px solid #363B63',
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
      [theme.breakpoints.down('sm')]: {
        padding: '0',
      },
    },
    '& .MuiTabs-flexContainer': {
      [theme.breakpoints.down('sm')]: {
        gap: '8px',
      },
    },
  },
});
