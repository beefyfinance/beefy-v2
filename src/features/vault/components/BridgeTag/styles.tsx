import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  tag: {
    ...theme.typography['subline-sm'],
    fontWeight: 700,
    padding: '2px 8px',
    background: theme.palette.background.vaults.defaultOutline,
    color: theme.palette.text.middle,
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    borderRadius: '4px',
    whiteSpace: 'nowrap' as const,
    lineHeight: '24px',
    '&:hover': {
      background: theme.palette.background.filters.active,
      cursor: 'pointer',
    },
  },
  icon: {
    width: '16px',
    height: '16px',
    display: 'block',
  },
  tooltip: {},
  link: {
    color: 'inherit',
    textDecoration: 'underline',
  },
});
