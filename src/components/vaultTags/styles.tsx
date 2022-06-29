import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  tag: {
    ...theme.typography['subline-sm'],
    padding: '2px 8px',
    borderRadius: '4px',
    whiteSpace: 'nowrap' as const,
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.filters.active,
    display: 'flex',
    alignItems: 'center',
    '& img': {
      height: '16px',
      marginRight: 4,
    },
  },
  tagImage: {
    width: '20px',
    height: '16px',
  },
});
