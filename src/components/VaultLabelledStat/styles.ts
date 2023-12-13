import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  label: {
    display: 'flex',
    alignItems: 'center',
  },
  labelText: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.dark,
  },
  tooltipTrigger: {
    width: '16px',
    height: '16px',
    flexShrink: 0,
    marginLeft: '4px',
    '& svg': {
      width: '16px',
      height: '16px',
    },
  },
  subValue: {
    ...theme.typography['body-sm'],
    color: theme.palette.text.dark,
  },
  blurValue: {
    filter: 'blur(.5rem)',
  },
  boostedValue: {
    color: theme.palette.background.vaults.boost,
  },
  lineThroughValue: {
    textDecoration: 'line-through',
  },
});
