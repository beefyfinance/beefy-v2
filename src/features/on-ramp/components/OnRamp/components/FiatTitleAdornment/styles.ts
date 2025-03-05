import { css } from '@repo/styles/css';

export const styles = {
  fiatAdornment: css.raw({
    background: 'transparent',
    padding: '0',
    margin: '0',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    color: 'text.light',
  }),
  flag: css.raw({
    marginRight: '8px',
  }),
};
