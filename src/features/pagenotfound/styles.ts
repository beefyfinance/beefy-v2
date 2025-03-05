import { css } from '@repo/styles/css';

export const styles = {
  inner: css.raw({
    margin: '0 auto',
    paddingTop: '120px',
    paddingBottom: '120px',
    width: '612px',
    maxWidth: '100%',
  }),
  image: css.raw({
    maxWidth: '100%',
    height: 'auto',
    margin: '0 auto',
    display: 'block',
  }),
  textContainer: css.raw({
    margin: '36px 0 0 0',
    textAlign: 'center',
  }),
  text: css.raw({
    textStyle: 'body.medium',
  }),
  button: css.raw({
    margin: '24px auto 0 auto',
  }),
};
