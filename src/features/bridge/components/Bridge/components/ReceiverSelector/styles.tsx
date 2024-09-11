import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  group: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  checkbox: {
    color: theme.palette.text.dark,
  },
  label: {
    ...theme.typography['subline-sm'],
    fontWeight: 700,
    color: 'inherit',
    flex: '1 1 40%',
  },
  check: {
    color: 'inherit',
    fill: 'currentColor',
    width: '16px',
    height: '16px',
  },
  checked: {
    '& $check': {
      color: 'inherit',
      fill: 'currentColor',
    },
  },
  input: {
    color: theme.palette.text.middle,
    background: theme.palette.background.searchInputBg,
    display: 'flex',
    alignItems: 'center',
    borderRadius: '8px',
    padding: '0px 12px',
    cursor: 'default',
    boxSizing: 'border-box' as const,
    position: 'relative' as const,
    justifyContent: 'space-between',
    minHeight: '52px',
    gap: '8px',
    '&.Mui-error': {
      border: `1px solid ${theme.palette.background.indicators.error}`,
    },
  },
});
