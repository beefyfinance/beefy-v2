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
  slider: {
    '-webkit-appearance': 'none' as const,
    height: '8px',
    width: '100%',
    zIndex: 999,
    margin: 0,
    padding: 0,
    background: props =>
      `linear-gradient(to right, ${theme.palette.text.secondary} 0%, ${theme.palette.background.contentLight} ${props.sliderValue}%)`,
    borderRadius: '0px 0px 8px 8px',
    outline: 'none',
    border: 'none',
    '&::-webkit-slider-thumb': {
      '-webkit-appearance': 'none' as const,
      height: '16px',
      width: '16px',
      background: theme.palette.text.dark,
      border: `2px solid ${theme.palette.text.secondary}`,
      borderRadius: '50%',
      cursor: 'pointer' as const,
    },
  },
  errorRange: {
    backgroundColor: `${theme.palette.background.indicators.error}7F`,
    '&::-webkit-slider-thumb': {
      backgroundColor: theme.palette.background.indicators.error,
    },
  },
});
