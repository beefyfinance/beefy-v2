import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  positive: {
    color: '#59A662',
  },
  negative: {
    color: '#D15347',
  },
  changes: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1em',
    width: '100%',
  },
});
