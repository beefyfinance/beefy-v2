import { css } from '@repo/styles/css';

export const styles = {
  label: css.raw({
    textStyle: 'subline.sm',
    color: 'text.dark',
    marginBottom: '8px',
  }),
  error: css.raw({
    textStyle: 'body.sm.medium',
    color: 'indicators.error',
    marginTop: '8px',
  }),
};
