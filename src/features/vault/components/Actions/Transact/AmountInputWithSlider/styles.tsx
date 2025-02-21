import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  input: {
    borderRadius: '8px 8px 0px 0px',
  },
  errorInput: {
    borderStyle: 'solid solid hidden solid',
  },
  warningInput: {
    borderStyle: 'solid solid hidden solid',
  },
  inputContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    borderRadius: '8px',
  },
  dataList: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: '4px',
  },
  itemList: {
    ...theme.typography['body-sm'],
    color: theme.palette.text.dark,
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    margin: 0,
    padding: 0,
    cursor: 'pointer' as const,
  },
  itemDisabled: {
    pointerEvents: 'none' as const,
  },
  active: {
    color: theme.palette.text.primary,
  },
  slider: {
    '-webkit-appearance': 'none' as const,
    height: '8px',
    width: '100%',
    zIndex: 995,
    margin: 0,
    padding: 0,
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
      '&:hover': {
        cursor: 'pointer' as const,
      },
    },
  },
  sliderBackground: {
    background: `linear-gradient(to right, ${theme.palette.text.secondary} 0%,${theme.palette.text.secondary} var(--value),${theme.palette.background.contentLight} var(--value), ${theme.palette.background.contentLight} 100%)`,
  },
  errorRange: {
    background: `${theme.palette.background.indicators.error}7F`,
    '&::-webkit-slider-thumb': {
      background: theme.palette.background.indicators.error,
    },
  },
  warningRange: {
    background: `${theme.palette.background.indicators.warning}7F`,
    '&::-webkit-slider-thumb': {
      background: theme.palette.background.indicators.warning,
    },
  },
});
