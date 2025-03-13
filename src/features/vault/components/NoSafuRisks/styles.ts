import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    textStyle: 'body',
    color: 'text.lightest',
    background: 'indicators.warning',
    padding: '16px',
    borderRadius: '8px',
  }),
  link: css.raw({
    color: 'text.lightest',
    textDecoration: 'underline',
    '&:hover': {
      cursor: 'pointer',
    },
  }),
};
