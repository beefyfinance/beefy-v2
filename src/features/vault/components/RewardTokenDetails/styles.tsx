import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    rowGap: '16px',
    borderRadius: '12px',
    backgroundColor: theme.palette.background.contentLight,
    padding: '16px',
  },
  text: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.light,
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
    lineHeight: 0,
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: theme.palette.background.buttons.button,
    borderColor: 'transparent' as const,
    color: theme.palette.text.middle,
    '&:hover': {
      color: theme.palette.text.light,
      backgroundColor: theme.palette.background.buttons.buttonHover,
      borderColor: 'transparent' as const,
      transition: 'color 0.1s',
    },
  },
  icon: {
    marginLeft: '4px',
    '&:hover': {
      fill: theme.palette.text.light,
    },
  },
});
