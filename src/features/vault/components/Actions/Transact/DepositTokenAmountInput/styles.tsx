import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  input: {
    borderRadius: '8px 8px 0px 0px',
  },
  errorInput: {
    borderStyle: 'solid solid hidden solid',
  },
  inputContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    borderRadius: '8px',
  },

  slider: {
    '-webkit-appearance': 'none' as const,
    width: '100%',
    borderRadius: '0px 0px 8px 8px',
    margin: 0,
    padding: 0,
    backgroundColor: theme.palette.background.contentLight,
    overflow: 'hidden',
    '&::-webkit-slider-thumb': {
      '-webkit-appearance': 'none' as const,
      appearance: 'none' as const,
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: theme.palette.text.dark,
      border: `2px solid ${theme.palette.text.secondary}`,
      cursor: 'pointer' as const,
      boxShadow: `-407px 0 0 400px ${theme.palette.text.dark}`,
    },
    '&::-webkit-range-thumb': {
      '-webkit-appearance': 'none' as const,
      appearance: 'none' as const,
      borderRadius: '50%',
      cursor: 'pointer' as const,
      overflow: 'hidden',
    },
    '&::-webkit-slider-runnable-track': {
      backgroundColor: theme.palette.background.contentLight,
      borderRadius: '0px 0px 8px 8px',
    },
  },
  errorRange: {
    backgroundColor: `${theme.palette.background.indicators.error}7F`,
    '&::-webkit-slider-thumb': {
      backgroundColor: theme.palette.background.indicators.error,
      boxShadow: `-407px 0 0 400px ${theme.palette.background.indicators.error}7F`,
    },
    '&::-webkit-slider-runnable-track': {
      backgroundColor: `${theme.palette.background.indicators.error}7F`,
    },
  },
  dataList: {
    ...theme.typography['body-sm'],
    color: theme.palette.text.dark,
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: '4px',
    '&:hover': {
      cursor: 'pointer' as const,
    },
  },
  active: {
    color: theme.palette.text.primary,
  },
});
