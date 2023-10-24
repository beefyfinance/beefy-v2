import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  entries: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.middle,
    padding: '16px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    background: '#232743',
  },
  entry: {
    display: 'flex',
    gap: '8px',
  },
  icon: {
    width: '24px',
    height: '24px',
    flexGrow: 0,
    flexShrink: 0,
  },
  text: {
    flexGrow: 1,
    flexShrink: 1,
  },
  tokenAmount: {
    fontWeight: theme.typography['body-lg-med'].fontWeight,
    color: '#DB8332',
  },
  link: {
    textDecoration: 'none',
    color: theme.palette.primary.main,
  },
});
