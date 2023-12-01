import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  tabs: {
    borderRadius: '12px 12px 0 0',
    display: 'flex',
    width: '100%',
    background: theme.palette.background.contentDark,
  },
  tab: {
    ...theme.typography['body-lg-med'],
    position: 'relative' as const,
    color: theme.palette.text.dark,
    background: 'transparent',
    flexBasis: '1px',
    flexGrow: 1,
    flexShrink: 0,
    padding: '16px 0',
    margin: 0,
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    cursor: 'pointer' as const,
    userSelect: 'none' as const,
    '&::after': {
      content: '""',
      position: 'absolute' as const,
      left: 0,
      bottom: 0,
      right: 0,
      height: '2px',
      background: theme.palette.background.border,
    },
    '&:first-child': {
      borderRadius: '12px 0 0 0',
    },
    '&:last-child': {
      borderRadius: '0 12px 0 0',
    },
  },
  selectedTab: {
    color: theme.palette.text.light,
    cursor: 'default' as const,
    pointerEvents: 'none' as const,
    '&::after': {
      backgroundColor: theme.palette.text.dark,
    },
  },
});
