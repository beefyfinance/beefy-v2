import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  container: {
    backgroundColor: theme.palette.background.content,
    padding: '16px',
    borderRadius: '12px',
  },
  titleContainer: {
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
      rowGap: '16px',
    },
  },
  title: {
    ...theme.typography['body-lg-med'],
    display: 'flex',
    '& span': {
      marginLeft: '8px',
    },
  },
  buttonsContainer: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    rowGap: '8px',
    columnGap: '8px',
    marginLeft: 'auto',
    [theme.breakpoints.down('sm')]: {
      marginLeft: '0',
    },
  },
  description: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.secondary,
    marginTop: '16px',
  },
});
