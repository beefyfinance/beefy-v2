import { css } from '@repo/styles/css';

export const styles = {
  title: css.raw({
    textStyle: 'h1',
    fontSize: '45px',
    lineHeight: '56px',
    color: 'text.light',
    marginBottom: '24px',
  }),
  text: css.raw({
    textStyle: 'body',
    color: 'text.middle',
  }),
  link: css.raw({
    textDecoration: 'none',
    color: 'green',
  }),
};
