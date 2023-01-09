import { Theme } from '@material-ui/core';

export const AUTO_REFRESH_SECONDS = 15;

export const styles = (theme: Theme) => ({
  holder: {
    display: 'flex',
    gap: '16px',
    marginBottom: '8px',
  },
  title: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.dark,
  },
  refreshButton: {
    padding: '0',
    margin: '0 0 0 auto',
    flexShrink: 0,
    flexGrow: 0,
    background: 'transparent',
    boxShadow: 'none',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    lineHeight: 1,
    width: '24px',
    height: '24px',
    position: 'relative' as const,
  },
  refreshIcon: {
    width: '24px',
    height: '24px',
    fill: '#59A662',
    position: 'relative' as const,
    zIndex: 2,
  },
});
