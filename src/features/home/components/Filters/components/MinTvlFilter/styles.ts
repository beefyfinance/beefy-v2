import { css } from '@repo/styles/css';

export const styles = {
  checkbox: css.raw({
    color: 'text.dark',
  }),
  largeTvlCheckbox: css.raw({
    color: 'text.dark',
    fontSize: 'body.sm',
  }),
  labelIcon: css.raw({
    '& img': {
      display: 'block',
    },
  }),
  amountContainer: css.raw({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
  }),
};
