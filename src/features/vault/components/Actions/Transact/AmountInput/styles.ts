import { css } from '@repo/styles/css';

export const styles = {
  inputContainer: css.raw({
    color: 'text.middle',
    background: 'purpleDarkest',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '8px',
    padding: '0px 12px',
    cursor: 'default',
    boxSizing: 'border-box',
    position: 'relative',
    justifyContent: 'space-between',
    minHeight: '52px',
    gap: '8px',
  }),
  inputContent: css.raw({
    display: 'flex',
    flexDirection: 'column',
    flexBasis: '50%',
    flexGrow: '1',
    flexShrink: '1',
    minWidth: '0',
  }),
  input: css.raw({
    textStyle: 'h2',
    padding: '0',
    margin: '0',
    border: 'none',
    background: 'none',
    boxShadow: 'none',
    width: '100%',
    color: 'text.light',
    height: 'auto',
    cursor: 'default',
    outline: 'none',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    '&::placeholder': {
      color: 'text.dark',
      opacity: '1',
    },
    _focus: {
      outline: 'none',
    },
  }),
  inputWithPrice: css.raw({
    textStyle: 'body.medium',
  }),
  error: css.raw({
    border: '1px solid {colors.indicators.error}',
  }),
  warning: css.raw({
    border: '1px solid {colors.indicators.warning}',
  }),
  fullWidth: css.raw({
    width: '100%',
  }),
  price: css.raw({
    textStyle: 'body.sm',
    color: 'text.dark',
  }),
  endAdornment: css.raw({
    flexGrow: '0',
    flexShrink: '0',
    flexBasis: 'auto',
  }),
  startAdornment: css.raw({
    flexGrow: '0',
    flexShrink: '0',
    flexBasis: 'auto',
  }),
};
