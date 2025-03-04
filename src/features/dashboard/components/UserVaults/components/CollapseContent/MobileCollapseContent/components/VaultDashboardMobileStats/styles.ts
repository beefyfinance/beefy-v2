import { css } from '@repo/styles/css';

export const styles = {
  inner: css.raw({
    display: 'flex',
    flexDirection: 'column',
    rowGap: '12px',
  }),
  statMobile: css.raw({
    display: 'flex',
    justifyContent: 'space-between',
  }),
  value: css.raw({
    textStyle: 'body.sm',
    textAlign: 'end',
  }),
  valueContainer: css.raw({
    display: 'flex',
    columnGap: '8px',
    alignItems: 'center',
  }),
  label: css.raw({
    textStyle: 'body.sm',
    color: 'text.dark',
  }),
};
