import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  item: {
    ...theme.typography['body-lg-med'],
    display: 'flex',
    flexWrap: 'nowrap' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    width: '100%',
    color: theme.palette.text.dark,
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    userSelect: 'none' as const,
    outline: 'none',
    textAlign: 'left' as const,
    '&:hover, &:focus-visible': {
      color: theme.palette.text.middle,
      '& $arrow': {
        color: '#fff',
      },
    },
  },
  side: {
    display: 'flex',
    flexWrap: 'nowrap' as const,
    alignItems: 'center',
    gap: '8px',
  },
  right: {
    flexShrink: 1,
    minWidth: 0,
  },
  icon: {
    width: '24px',
    height: '24px',
  },
  symbol: {
    whiteSpace: 'nowrap' as const,
  },
  tag: {
    ...theme.typography['body-sm-med'],
    color: theme.palette.text.middle,
    background: theme.palette.background.buttons.button,
    padding: '2px 8px',
    borderRadius: '4px',
    whiteSpace: 'nowrap' as const,
  },
  balance: {
    flexShrink: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  arrow: {
    color: theme.palette.text.middle,
    height: '24px',
  },
});
