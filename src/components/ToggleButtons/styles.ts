import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  buttons: {
    display: 'flex',
    width: 'fit-content',
    border: `solid 2px ${theme.palette.background.v2.contentPrimary}`,
    borderRadius: '8px',
    backgroundColor: theme.palette.background.v2.contentDark,
  },
  fullWidth: {
    width: '100%',
  },
  button: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.disabled,
    backgroundColor: 'inherit',
    border: 'none',
    borderRadius: '6px',
    boxShadow: 'none',
    cursor: 'pointer',
    margin: 0,
    padding: `6px 16px`,
    flexGrow: 1,
    flexShrink: 0,
    '&:hover': {
      color: theme.palette.text.secondary,
      boxShadow: 'none',
    },
    '&:active, &:hover:active': {
      color: theme.palette.text.primary,
    },
  },
  selected: {
    pointerEvents: 'none' as const,
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.v2.button,
    '&:hover': {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.v2.button,
    },
  },
  untogglable: {
    padding: `${8 - 2}px ${16 - 12 - 2}px`,
    '& $button': {
      padding: '0 12px',
      '&:hover': {
        color: theme.palette.text.secondary,
        backgroundColor: 'transparent',
      },
      '&:active, &:hover:active': {
        color: theme.palette.text.primary,
        backgroundColor: 'transparent',
      },
      '&$selected': {
        pointerEvents: 'all' as const,
        color: theme.palette.text.primary,
        backgroundColor: 'transparent',
        '&:hover': {
          color: theme.palette.text.primary,
          backgroundColor: 'transparent',
        },
      },
    },
  },
  dropdown: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '8px',
    padding: `12px`,
    backgroundColor: theme.palette.background.v2.contentLight,
    borderRadius: '8px',
    marginTop: '8px',
    marginLeft: '4px',
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.dark,
    fill: theme.palette.text.dark,
    '&:hover': {
      color: theme.palette.text.primary,
      fill: theme.palette.text.primary,
      cursor: 'pointer',
    },
  },
  icon: {
    height: '20px',
  },
  iconActive: {
    fill: theme.palette.text.primary,
  },
  buttonList: {
    ...theme.typography['body-lg-med'],
    color: '#848BAD',
    backgroundColor: 'inherit',
    border: 'none',
    padding: 0,
    textAlign: 'start' as const,
    '&:hover': {
      color: theme.palette.text.primary,
      cursor: 'pointer',
    },
  },
  selectedList: {
    color: theme.palette.text.primary,
  },
});
