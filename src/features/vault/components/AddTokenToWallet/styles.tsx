import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    rowGap: '16px',
    borderRadius: '12px',
    backgroundColor: theme.palette.background.v2.contentLight,
    padding: '16px',
  },
  text: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.primary,
    marginLeft: '8px',
  },
  token: {
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
  },
  buttons: {
    display: 'flex',
    columnGap: '8px',
    rowGap: '8px',
    flexWrap: 'wrap' as const,
  },
  button: {
    ...theme.typography['body-lg'],
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: theme.palette.background.v2.button,
    borderColor: 'transparent' as const,
    color: theme.palette.text.secondary,
    '&:hover': {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.v2.buttonHover,
      borderColor: 'transparent' as const,
      transition: 'color 0.1s',
    },
  },
  icon: {
    marginLeft: '4px',
    '&:hover': {
      fill: theme.palette.text.primary,
    },
  },
});
