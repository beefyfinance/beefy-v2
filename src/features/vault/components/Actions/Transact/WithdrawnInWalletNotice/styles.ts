import { css } from '@repo/styles/css';

export const styles = {
  introduction: css.raw({}),
  title: css.raw({
    textStyle: 'h1',
    fontSize: '45px',
    lineHeight: '56px',
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
