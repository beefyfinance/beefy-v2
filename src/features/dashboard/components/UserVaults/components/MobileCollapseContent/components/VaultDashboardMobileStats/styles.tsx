import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  inner: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '12px',
  },
  statMobile: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  triggerContainer: {
    display: 'flex',
    columnGap: '8px',
    alignItems: 'center',
  },
  value: {
    ...theme.typography['body-sm'],
    color: theme.palette.text.middle,
  },
  label: {
    ...theme.typography['body-sm'],
    color: theme.palette.text.dark,
  },
});
