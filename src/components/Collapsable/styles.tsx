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
    justifyContent: 'space-between',
  },
  iconButton: {
    padding: 0,
    '& .MuiSvgIcon-root': {
      fill: '#999CB3',
    },
    '&:hover': {
      backgroundColor: 'transparent' as const,
    },
  },
});
