import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  container: {
    borderRadius: '12px',
    backgroundColor: '#2D3153',
  },
  header: {
    padding: '24px',
    borderRadius: '12px 12px 0px 0px',
    backgroundColor: '#232743',
  },
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
    display: 'flex',
    justifyContent: 'space-between',
    alingItems: 'center',
    borderTop: '2px solid #363B63',
    padding: '8px 24px',
    borderRadius: '0px 0px 12px 12px',
    [theme.breakpoints.down('md')]: {
      padding: '8px 16px',
    },
    '& .MuiTabs-root': {
      minHeight: '38px',
    },
    '& .MuiTab-root': {
      minHeight: '34px',
    },
    [theme.breakpoints.down('xs')]: {
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      rowGap: theme.spacing(1),
    },
  },
  checkboxContainer: {
    display: 'flex',
    columnGap: '24px',
    [theme.breakpoints.down('xs')]: {
      order: 2,
      width: '100%',
      justifyContent: 'flex-end',
    },
  },

  label: {
    ...theme.typography['subline-lg'],
    fontWeight: 700,
  },
  graphContainer: {
    padding: '24px 24px',
  },
  averageLine: {
    height: '2px',
    width: '12px',
    backgroundColor: '#59A662',
    borderRadius: '2px',
    marginRight: theme.spacing(0.5),
  },
  movingAverageLine: {
    height: '2px',
    width: '12px',
    backgroundColor: '#4F93C4',
    borderRadius: '2px',
    marginRight: theme.spacing(0.5),
  },
});
