import type { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  container: {
    backgroundColor: theme.palette.background.v2.cardBg,
    padding: '24px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: '24px',
    borderRadius: '8px',
  },
  icon: {
    width: '120px',
    height: '120px',
    [theme.breakpoints.up('md')]: {
      width: '132px',
      height: '132px',
    },
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: '4px',
  },
  title: {
    ...theme.typography.h3,
    color: theme.palette.text.primary,
    textAlign: 'center' as const,
  },
  text: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.secondary,
    textAlign: 'center' as const,
  },
  actionsContainer: {
    display: 'grid',
    gap: '12px',
  },
  dividerContainer: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
    width: '272px',
  },
  line: {
    height: '2px',
    width: '100%',
    backgroundColor: '#2D3153',
    borderRadius: '8px',
  },
  btn: {
    width: '100%',
    padding: '6px 12px',
    maxWidth: '272px',
  },
  or: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.disabled,
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
  },
});
