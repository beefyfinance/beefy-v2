import { css } from '@repo/styles/css';

export const styles = {
  apyTitle: css.raw({
    textStyle: 'h3',
    color: 'text.middle',
    marginBottom: '8px',
  }),
  apys: css.raw({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px 32px',
  }),
  apyLabel: css.raw({
    textStyle: 'subline.sm',
    color: 'text.dark',
  }),
  apyValue: css.raw({
    textStyle: 'body.medium',
    color: 'text.middle',
  }),
};
