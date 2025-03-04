import { css } from '@repo/styles/css';

export const styles = {
  tokenAdornment: css.raw({
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
  icon: css.raw({
    marginRight: '8px',
  }),
};
