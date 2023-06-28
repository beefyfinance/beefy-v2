import type { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  shortAddress: {
    ...theme.typography['h3'],
    color: theme.palette.text.disabled,
  },
  longAddress: {
    [theme.breakpoints.down('xs')]: {
      ...theme.typography['body-sm'],
    },
  },
  triggerClass: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
  tooltipContent: {
    '&:hover': {
      cursor: 'pointer',
    },
    [theme.breakpoints.up('xs')]: {
      maxWidth: 'min(100%, 450px)',
    },
  },
});
