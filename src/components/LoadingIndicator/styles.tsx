import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    width: '100%',
    height: '100%',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'inherit',
  },
  icon: {
    marginBottom: '24px',
  },
  text: {
    ...theme.typography['subline-lg'],
    color: '#999CB3',
  },
});
