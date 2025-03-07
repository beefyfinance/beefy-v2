import { css } from '@repo/styles/css';

export const styles = {
  holder: css.raw({
    background: 'background.content.light',
    borderRadius: '8px',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  }),
  amountWithValue: css.raw({
    display: 'flex',
    flexDirection: 'column',
  }),
  amount: css.raw({
    textStyle: 'body.medium',
    color: 'text.middle',
  }),
  value: css.raw({
    textStyle: 'body.sm',
    color: 'text.dark',
  }),
  tokenWithIcon: css.raw({
    display: 'flex',
    textAlign: 'right',
    alignItems: 'center',
    gap: '8px',
  }),
  token: css.raw({
    textStyle: 'body.medium',
    color: 'text.middle',
  }),
  icon: css.raw({
    width: '32px',
    height: '32px',
  }),
};
