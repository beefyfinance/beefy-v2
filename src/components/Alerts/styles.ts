import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  alert: {
    display: 'flex',
    flexDirection: 'row' as const,
    columnGap: '8px',
    minWidth: 0,
    width: '100%',
    borderRadius: '8px',
    padding: '16px',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 245, 255, 0.08)',
  },
  icon: {
    width: '24px',
    height: '24px',
    flexShrink: 0,
    flexGrow: 0,
  },
  content: {
    ...theme.typography['body-lg'],
    flexShrink: 1,
    flexGrow: 1,
    minWidth: 0,
    color: theme.palette.text.middle,
    wordBreak: 'break-word' as const,
    '& a': {
      color: theme.palette.text.middle,
    },
    '& p:first-child': {
      marginTop: 0,
    },
    '& p:last-child': {
      marginBottom: 0,
    },
  },
  warning: {
    backgroundColor: 'rgba(209, 152, 71, 0.15)',
    '& $icon': {
      fill: theme.palette.background.indicators.warning,
    },
  },
  error: {
    backgroundColor: 'rgba(209, 83, 71, 0.15)',
    '& $icon': {
      fill: theme.palette.background.indicators.error,
    },
  },
  info: {
    backgroundColor: `${theme.palette.background.indicators.info}26`,
    '& $icon': {
      fill: theme.palette.background.indicators.info,
    },
  },
});
