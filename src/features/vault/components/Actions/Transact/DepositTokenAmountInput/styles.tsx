import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  input: {
    borderRadius: '8px 8px 0px 0px',
  },
  inputContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  slider: {
    '-webkit-appearance': 'none' as const,
    width: '100%',
    borderRadius: '0px 0px 8px 8px',
    backgroundColor: theme.palette.background.contentLight,
    margin: 0,
    padding: 0,
    '&::-webkit-slider-thumb': {
      '-webkit-appearance': 'none' as const,
      appearance: 'none' as const,
      width: '16px',
      height: '16px',
      borderRadius: '50%',
      backgroundColor: '#999CB3',
      cursor: 'pointer' as const,
    },
    '&::-moz-range-thumb': {
      width: '25px',
      height: '25px',
      borderRadius: '50%',
      backgroundColor: '#999CB3',
      cursor: 'pointer' as const,
    },
  },
});
