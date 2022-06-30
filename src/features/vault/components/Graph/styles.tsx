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
    justifyContent: 'space-between',
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
    [theme.breakpoints.down('xs')]: {
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      rowGap: theme.spacing(1),
    },
  },
  checkboxContainer: {
    display: 'flex',
    columnGap: theme.spacing(2),
    [theme.breakpoints.down('xs')]: {
      order: 2,
      width: '100%',
      justifyContent: 'flex-end',
    },
  },
  checkbox: {
    color: '#848BAD',
  },
  label: {
    ...theme.typography['subline-lg'],
  },
  averageLine: {
    height: '15px',
    width: '2px',
    backgroundColor: '#59A662',
    borderRadius: '2px',
    marginRight: theme.spacing(0.5),
  },
  movingAverageLine: {
    height: '15px',
    width: '2px',
    backgroundColor: '#4F93C4',
    borderRadius: '2px',
    marginRight: theme.spacing(0.5),
  },
});
