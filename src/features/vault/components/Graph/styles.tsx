import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  titleBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row' as const,
      alignItems: 'center',
    },
  },
  headerTabs: {
    marginTop: 10,
    '& .MuiTabs-root': {
      minHeight: '38px',
    },
    '& .MuiTab-root': {
      minHeight: '34px',
    },
    [theme.breakpoints.up('sm')]: {
      marginTop: 0,
      marginLeft: 'auto',
    },
  },
  footerTabs: {
    marginTop: '12px',
    display: 'flex',
    justifyContent: 'flex-end',
    '& .MuiTabs-root': {
      minHeight: 0,
    },
    '& .MuiTabs-flexContainer': {
      columnGap: '24px',
    },
    '& .MuiTab-root': {
      ...theme.typography['subline-lg'],
      padding: 0,
      height: 'auto',
      minHeight: 0,
    },
  },
});
