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
    [theme.breakpoints.down('md')]: {
      padding: '16px',
    },
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
  label: {
    ...theme.typography['subline-lg'],
    fontWeight: 700,
  },
  graphContainer: {
    padding: '24px',
    '& text': {
      ...theme.typography['subline-sm'],
      fill: theme.palette.text.disabled,
    },
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
