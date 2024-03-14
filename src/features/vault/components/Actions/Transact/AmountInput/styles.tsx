import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  inputContainer: {
    color: theme.palette.text.middle,
    background: theme.palette.background.searchInputBg,
    display: 'flex',
    alignItems: 'center',
    borderRadius: '8px',
    padding: '0px 12px',
    cursor: 'default',
    boxSizing: 'border-box' as const,
    position: 'relative' as const,
    justifyContent: 'space-between',
    minHeight: '48px',
  },
  inputContent: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  input: {
    ...theme.typography['h2'],
    padding: 0,
    margin: 0,
    border: 'none',
    background: 'none',
    boxShadow: 'none',
    width: '100%',
    color: theme.palette.text.light,
    height: 'auto',
    cursor: 'default',
    outline: 0,
    '&::placeholder': {
      color: theme.palette.text.dark,
      opacity: 1,
    },
    '&::focus ': {
      outline: 0,
    },
  },
  inputWithPrice: {
    ...theme.typography['body-lg-med'],
  },
  error: {
    border: `1px solid ${theme.palette.background.indicators.error}`,
  },
  fullWidth: {
    width: '100%',
  },
  price: {
    ...theme.typography['body-sm'],
    lineHeight: '12px',
    color: theme.palette.text.dark,
  },
  max: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.light,
    backgroundColor: theme.palette.background.border,
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    borderRadius: '4px',
    margin: 0,
    padding: '6px 12px',
    minWidth: 0,
    flexShrink: 0,
    cursor: 'pointer',
    marginRight: '12px',
    '&:disabled': {
      color: theme.palette.text.dark,
      backgroundColor: theme.palette.background.buttons.button,
      borderColor: theme.palette.background.contentLight,
      opacity: 0.4,
    },
  },
  endAdornement: {
    position: 'absolute' as const,
    right: 0,
    marginRight: '12px',
  },
});
