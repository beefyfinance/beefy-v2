import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  checkbox: {
    ...theme.typography['body-lg-med'],
    display: 'flex',
    alignItems: 'center',
    color: '#D0D0DA',
    cursor: 'pointer',
  },
  icon: {
    color: '#848BAD',
    marginRight: `${8 - 3}px`,
  },
  label: {
    display: 'flex',
    alignItems: 'center',
  },
  checked: {
    '& $icon': {
      color: '#F5F5FF',
    },
  },
});
