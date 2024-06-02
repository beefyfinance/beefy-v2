import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    ...theme.typography['body-lg-med'],
    position: 'relative' as const,
    color: theme.palette.text.middle,
    background: theme.palette.background.contentDark,
    padding: '16px 24px',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    display: 'flex',
    columnGap: '12px',
    alignItems: 'center',
    '&::after': {
      content: '""',
      position: 'absolute' as const,
      left: 0,
      bottom: 0,
      right: 0,
      height: '2px',
      background: theme.palette.background.border,
    },
  },
  backButton: {
    ...theme.typography['body-lg-med'],
    display: 'flex',
    gap: '8px',
    margin: 0,
    padding: 0,
    boxShadow: 'none',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    color: 'inherit',
  },
  backIcon: {
    background: theme.palette.background.border,
    color: theme.palette.text.light,
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    flexShrink: 0,
    flexGrow: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fill: theme.palette.text.light,
    width: '12px',
    height: '9px',
  },
});
