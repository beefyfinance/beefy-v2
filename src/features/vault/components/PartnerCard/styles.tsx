import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  link: {
    textDecoration: 'none' as const,
  },
  container: {
    marginTop: '16px',
    backgroundColor: theme.palette.background.content,
    padding: '16px',
    borderRadius: '12px',
    '&:Hover': {
      backgroundColor: theme.palette.background.vaults.defaultOutline,
    },
  },
  title: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.primary,
    display: 'flex',
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
