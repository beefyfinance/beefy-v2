import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  value: {
    ...theme.typography['body-lg-med'],
    color: '#D0D0DA',
  },
  subValue: {
    ...theme.typography['body-sm'],
    color: '#8A8EA8',
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
