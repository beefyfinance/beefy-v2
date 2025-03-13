import { css } from '@repo/styles/css';

export const styles = {
  message: css.raw({
    padding: '24px',
    background: 'background.content',
    borderBottomLeftRadius: '8px',
    borderBottomRightRadius: '8px',
  }),
  title: css.raw({
    textStyle: 'h3',
    color: 'text.middle',
    margin: '0 0 4px 0',
  }),
  text: css.raw({
    textStyle: 'body',
    color: 'text.middle',
  }),
  extra: css.raw({
    marginTop: '24px',
  }),
};
