import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  container: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.middle,
    display: 'flex',
    columnGap: '8px',
    alignItems: 'center',
  },
  icon: {
    width: '24px',
    height: '24px',
  },
});
