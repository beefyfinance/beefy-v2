import { css } from '@repo/styles/css';

export const styles = {
  valueStrikethrough: css.raw({
    textStyle: 'subline.sm',
    color: 'text.dark',
    textAlign: 'left',
    textDecoration: 'line-through',
  }),
  value: css.raw({
    textStyle: 'body.medium',
    margin: '0',
    padding: '0',
  }),
};
