import { css } from '@repo/styles/css';

export const styles = {
  title: css.raw({
    textStyle: 'h1',
    color: 'text.light',
    marginTop: '0',
  }),
  text: css.raw({
    textStyle: 'body',
    color: 'text.middle',
  }),
  link: css.raw({
    color: 'text.lightest',
    textDecoration: 'underline',
    '&:hover': {
      cursor: 'pointer',
    },
  }),
};
