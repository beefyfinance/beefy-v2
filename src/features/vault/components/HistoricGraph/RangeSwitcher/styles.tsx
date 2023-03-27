import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  tabs: {
    border: 0,
    padding: 0,
    background: 'transparent',
    gap: '12px',
  },
  tab: {
    border: 0,
    padding: 0,
    background: 'transparent',
    '&:hover': {
      background: 'transparent',
    },
  },
  selected: {
    background: 'transparent',
  },
});
