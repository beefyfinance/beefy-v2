import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  toggles: {
    display: 'flex',
    gap: '8px 16px',
    flexWrap: 'wrap' as const,
  },
  toggleCheckbox: {},
  toggleIcon: {
    fontSize: '20px',
    width: '20px',
    height: '20px',
  },
  toggleLabel: {
    ...theme.typography['subline-sm'],
    display: 'flex',
    gap: '8px',
    color: theme.palette.text.disabled,
  },
  toggleLabelLine: {
    height: '2px',
    width: '12px',
  },
});
