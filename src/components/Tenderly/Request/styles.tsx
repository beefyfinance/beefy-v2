import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  label: {
    ...theme.typography['subline-sm'],
    marginBottom: '4px',
  },
  calls: {
    display: 'grid',
    gridTemplateColumns: 'auto auto auto minmax(0, 1fr)',
    gap: '4px 8px',
  },
  callHeader: {
    fontWeight: theme.typography['body-sm-med'].fontWeight,
  },
  callData: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});
