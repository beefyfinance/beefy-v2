import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  button: {
    padding: '6px 12px',
    margin: 0,
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    background: theme.palette.background.contentDark,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    pointerEvents: 'none' as const,
  },
  buttonMore: {
    padding: '6px 6px 6px 12px',
    cursor: 'pointer' as const,
    pointerEvents: 'auto' as const,
  },
  iconAssets: {
    width: '32px',
    height: '32px',
    flexShrink: 0,
    flexGrow: 0,
  },
  iconMore: {
    flexShrink: 0,
    flexGrow: 0,
    fill: theme.palette.text.middle,
  },
  select: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.primary,
    display: 'flex',
    columnGap: '8px',
    alignItems: 'center',
  },
  zapIcon: {
    height: '24px',
    width: '24px',
    backgroundColor: theme.palette.background.contentLight,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& img': {
      height: '18px',
    },
  },
  breakLp: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.primary,
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  forceSelection: {
    color: theme.palette.text.dark,
  },
});
