import type { Theme } from '@material-ui/core';

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
  value: {
    ...theme.typography['body-sm'],
    textAlign: 'end' as const,
  },
  valueContainer: {
    display: 'flex',
    columnGap: '8px',
    alignItems: 'center',
  },
  label: {
    ...theme.typography['body-sm'],
    color: theme.palette.text.dark,
  },
});
