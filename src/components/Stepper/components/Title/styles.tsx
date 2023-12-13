import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  title: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.background.txsModal.text,
    display: 'flex',
    alignItems: 'center',
  },
  titleContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    flexShrink: 0,
    marginBottom: '4px',
  },
  closeIcon: {
    padding: 0,
  },
});
