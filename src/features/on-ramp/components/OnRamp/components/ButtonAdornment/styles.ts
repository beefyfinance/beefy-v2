import { css } from '@repo/styles/css';

export const styles = {
  button: css.raw({
    textStyle: 'body.medium',
    color: 'text.middle',
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    margin: '0',
    padding: '0',
    cursor: 'pointer',
    '&:hover, &:focus-visible': {
      color: 'text.light',
      '& > .button-arrow': {
        color: 'text.middle',
      },
    },
  }),
  arrow: css.raw({
    color: 'text.dark',
    height: '24px',
  }),
};
