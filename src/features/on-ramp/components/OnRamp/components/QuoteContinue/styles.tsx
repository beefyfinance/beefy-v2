import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column' as const,
    rowGap: '24px',
  },
  arrow: {
    color: '#999CB3',
    height: '24px',
  },
});
