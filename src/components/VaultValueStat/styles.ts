import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  value: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.middle,
  },
  subValue: {
    ...theme.typography['body-sm'],
    color: theme.palette.text.dark,
  },
  blurValue: {
    filter: 'blur(.5rem)',
  },
  boostedValue: {
    color: '#DB8332',
  },
  lineThroughValue: {
    textDecoration: 'line-through',
  },
});
