import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  checkbox: {
    color: '#848BAD',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
  },
  labelIcon: {
    marginRight: '8px',
    '& img': {
      display: 'block',
    },
  },
  icon: {},
  checked: {
    '& $icon': {
      color: '#fff',
    },
  },
});
