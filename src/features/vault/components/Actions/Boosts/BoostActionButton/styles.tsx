import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    padding: 12,
    borderRadius: '8px',
    backgroundColor: '#242842',
  },
  title: {
    display: 'flex',
    ...theme.typography['body-lg'],
    color: theme.palette.text.secondary,
    alignItems: 'center',
    '&:Hover': {
      cursor: 'pointer ' as const,
    },
  },
  iconButton: {
    padding: 0,
    '& .MuiSvgIcon-root': {
      fill: theme.palette.text.disabled,
    },
    '&:hover': {
      backgroundColor: 'transparent' as const,
    },
    marginRight: '4px',
  },
  text: {
    ...theme.typography['body-lg'],
    flexGrow: 1,
  },
  balance: {
    ...theme.typography['body-sm'],
    color: theme.palette.text.secondary,
    '& span': {
      color: theme.palette.text.disabled,
    },
  },
  actions: {
    display: 'flex',
    flexDirection: 'column' as const,
    marginTop: '8px',
    rowGap: '16px',
  },
  button: {
    backgroundColor: theme.palette.background.v2.contentLight,
    '&:Hover': {
      backgroundColor: '#272B4A',
    },
    '&:disabled': {
      borderColor: 'transparent' as const,
    },
  },
  maxButton: {
    ...theme.typography['subline-sm'],
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '4px',
    marginRight: `${8 - 2}px`,
    backgroundColor: theme.palette.background.v2.contentLight,
    borderColor: 'transparent' as const,
    '&:disabled': {
      borderColor: 'transparent' as const,
    },
  },
  input: {
    color: theme.palette.text.secondary,
    background: '#1B1E31',
    borderRadius: '8px',
    width: '100%',
    display: 'flex',
    border: 'solid 2px #1B1E31',
    '& .MuiInputBase-input': {
      ...theme.typography['h3'],
      padding: `${8 - 2}px 16px`,
      color: theme.palette.text.secondary,
      height: 'auto',
      '&:focus': {
        color: theme.palette.text.primary,
      },
      '&::placeholder': {
        color: theme.palette.text.secondary,
        opacity: 1,
      },
    },
    '& .MuiInputBase-inputAdornedEnd': {},
  },
});
