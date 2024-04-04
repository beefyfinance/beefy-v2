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
    minHeight: '52px',
    gap: '8px',
  },
  inputContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    flexBasis: '50%',
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
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
    textOverflow: 'ellipsis',
    overflow: 'hidden',
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
    color: theme.palette.text.dark,
  },
  endAdornment: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
  },
});
