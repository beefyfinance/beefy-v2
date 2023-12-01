import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  priceWithChange: {
    ...theme.typography['subline-sm'],
    fontWeight: 700,
    padding: '4px 8px',
    background: theme.palette.background.buttons.button,
    color: theme.palette.text.middle,
    display: 'inline-flex',
    alignItems: 'center',
    flexWrap: 'nowrap' as const,
    whiteSpace: 'nowrap' as const,
    gap: '4px',
    borderRadius: '4px',
    userSelect: 'none' as const,
  },
  tooltipTrigger: {
    cursor: 'pointer',
    '&:hover': {
      background: theme.palette.background.buttons.buttonHover,
      cursor: 'pointer',
    },
  },
  price: {},
  change: {
    display: 'inline-flex',
    alignItems: 'center',
    flexWrap: 'nowrap' as const,
    whiteSpace: 'nowrap' as const,
    gap: '2px',
    fontSize: '0.8em',
    color: theme.palette.text.dark,
  },
  changeValue: {},
  positive: {
    '& $change': {
      color: '#509658',
    },
  },
  negative: {
    '& $change': {
      color: '#E84525',
    },
  },
});
