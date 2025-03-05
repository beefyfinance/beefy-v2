import { css } from '@repo/styles/css';

export const styles = {
  rewards: css.raw({
    textStyle: 'body.medium',
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) auto',
    gap: '8px',
    color: 'text.middle',
    padding: '0',
  }),
  icon: css.raw({
    width: '24px',
    height: '24px',
  }),
  amount: css.raw({
    display: 'inline-flex',
    gap: '4px',
  }),
  value: css.raw({}),
};
