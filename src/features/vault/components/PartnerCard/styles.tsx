import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  container: {
    marginTop: '16px',
    backgroundColor: theme.palette.background.content,
    padding: '16px',
    borderRadius: '12px',
  },
  title: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.primary,
    display: 'flex',
    textDecoration: 'none' as const,
  },
  icon: {
    height: '24px',
    width: '24px',
    marginRight: '8px',
  },
  content: {
    marginTop: '16px',
    ...theme.typography['body-lg'],
    color: theme.palette.text.secondary,
  },
});
