import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  link: {
    display: 'inline-flex',
    flexDirection: 'row' as const,
    justifyContent: 'center',
    alignItems: 'center',
    textDecoration: 'none',
    backgroundColor: theme.palette.background.vaults.defaultOutline,
    padding: '2px 8px',
    borderRadius: '4px',
    color: theme.palette.text.secondary,
  },
  icon: {
    fontSize: 'inherit',
    marginRight: '4px',
  },
});
