import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  input: {
    color: theme.palette.text.secondary,
    background: theme.palette.background.v2.searchBg,
    borderRadius: '8px',
    width: '100%',
    display: 'flex',
    cursor: 'default',
    '& .MuiInputBase-input': {
      ...theme.typography['h3'],
      padding: '12px 16px',
      color: theme.palette.text.light,
      height: 'auto',
      cursor: 'default',
      '&::placeholder': {
        color: theme.palette.text.dark,
        opacity: 1,
      },
    },
  },
  error: {
    borderColor: theme.palette.background.v2.indicators.warning,
  },
  max: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.light,
    backgroundColor: theme.palette.background.v2.border,
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    borderRadius: '4px',
    margin: 0,
    padding: '6px 12px',
    minWidth: 0,
    flexShrink: 0,
    cursor: 'pointer',
    marginRight: '8px',
    '&:disabled': {
      color: theme.palette.text.disabled,
      backgroundColor: '#262A40',
      borderColor: theme.palette.background.v2.contentLight,
      opacity: 0.4,
    },
  },
});
