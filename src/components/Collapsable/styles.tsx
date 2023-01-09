import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  container: {
    padding: 24,
    borderRadius: '12px',
    backgroundColor: theme.palette.background.paper,
  },
  content: {
    padding: 16,
  },
  title: {
    display: 'flex',
    padding: 0,
    justifyContent: 'space-between',
    backgroundColor: 'transparent' as const,
    borderColor: 'transparent' as const,
    '&:Hover': {
      backgroundColor: 'transparent' as const,
      borderColor: 'transparent' as const,
    },
  },
  titleIcon: {
    fill: '#999CB3',
  },
});
