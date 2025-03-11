import { css } from '@repo/styles/css';

export const styles = {
  input: css.raw({
    borderRadius: '8px 8px 0px 0px',
  }),
  errorInput: css.raw({
    borderStyle: 'solid solid hidden solid',
  }),
  warningInput: css.raw({
    borderStyle: 'solid solid hidden solid',
  }),
  inputContainer: css.raw({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '8px',
  }),
  dataList: css.raw({
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: '4px',
  }),
  itemList: css.raw({
    textStyle: 'body.sm',
    color: 'text.dark',
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    margin: '0',
    padding: '0',
    cursor: 'pointer',
  }),
  itemDisabled: css.raw({
    pointerEvents: 'none',
  }),
  active: css.raw({
    color: 'text.lightest',
  }),
  slider: css.raw({
    appearance: 'none',
    height: '8px',
    width: '100%',
    zIndex: 'slider',
    margin: '0',
    padding: '0',
    borderRadius: '0px 0px 8px 8px',
    outline: 'none',
    border: 'none',
    '&::-webkit-slider-thumb': {
      appearance: 'none',
      height: '16px',
      width: '16px',
      background: 'text.dark',
      border: '2px solid {colors.text.light}',
      borderRadius: '50%',
      '&:hover': {
        cursor: 'pointer',
      },
    },
  }),
  sliderBackground: css.raw({
    background:
      'linear-gradient(to right, {colors.text.light} 0%,{colors.text.light} var(--value),{colors.background.content.light} var(--value), {colors.background.content.light} 100%)',
  }),
  errorRange: css.raw({
    background: '{colors.transactErrorBackground}',
    '&::-webkit-slider-thumb': {
      background: 'indicators.error',
    },
  }),
  warningRange: css.raw({
    background: '{colors.transactWarningBackground}',
    '&::-webkit-slider-thumb': {
      background: 'indicators.warning',
    },
  }),
};
