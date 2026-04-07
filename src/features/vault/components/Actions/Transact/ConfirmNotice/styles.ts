import { css } from '@repo/styles/css';

export const styles = {
  positive: css.raw({
    color: 'green.40',
  }),
  negative: css.raw({
    color: 'indicators.error',
  }),
  changes: css.raw({
    display: 'flex',
    flexDirection: 'column',
    gap: '1em',
    width: '100%',
    marginTop: '8px',
  }),
  usdValue: css.raw({
    textStyle: 'body.sm',
    color: 'text.dark',
  }),
};
