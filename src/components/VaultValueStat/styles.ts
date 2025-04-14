import { css } from '@repo/styles/css';

export const styles = {
  value: css.raw({
    textStyle: 'body.medium',
    color: 'text.middle',
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    maxWidth: '100%',
  }),
  subValue: css.raw({
    textStyle: 'body.sm',
    color: 'text.dark',
  }),
  blurValue: css.raw({
    filter: 'blur(.5rem)',
  }),
  boostedValue: css.raw({
    color: 'text.boosted',
  }),
  lineThroughValue: css.raw({
    textDecoration: 'line-through',
  }),
};
