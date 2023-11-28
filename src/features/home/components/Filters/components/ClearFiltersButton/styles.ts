import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  icon: {
    marginRight: '8px',
  },
  badge: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    flexGrow: 0,
    width: '24px',
    height: '24px',
    marginRight: '8px',
    '&:before': {
      ...theme.typography['body-sm-med'],
      content: 'attr(data-count)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
      flexGrow: 0,
      backgroundColor: theme.palette.background.indicators.error,
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      color: '#fff',
    },
  },
});
