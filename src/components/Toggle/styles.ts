import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  label: {
    ...theme.typography['subline-sm'],
    position: 'relative' as const,
    color: theme.palette.text.dark,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  input: {
    position: 'absolute' as const,
    opacity: 0,
    overflow: 'hidden',
    height: 0,
    width: 0,
  },
  channel: {
    position: 'relative' as const,
    background: theme.palette.background.contentDark,
    width: '44px',
    height: '24px',
    borderRadius: '40px',
  },
  dot: {
    position: 'absolute' as const,
    top: '2px',
    left: '2px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: theme.palette.background.contentLight,
    transition: 'background-color 0.4s ease, left 0.4s ease',
  },
  dotChecked: {
    backgroundColor: theme.palette.primary.main,
    left: '22px',
  },
});
