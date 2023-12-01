import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  link: {
    display: 'inline-flex',
    flexDirection: 'row' as const,
    justifyContent: 'center',
    alignItems: 'center',
    textDecoration: 'none',
    backgroundColor: theme.palette.background.contentLight,
    padding: '2px 8px',
    borderRadius: '4px',
    color: theme.palette.text.middle,
  },
  icon: {
    fontSize: 'inherit',
    marginRight: '4px',
  },
});
