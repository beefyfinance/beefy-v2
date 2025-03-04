import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    display: 'flex',
    alignItems: 'flex-end',
  }),
  barsContainer: css.raw({
    display: 'flex',
    alignItems: 'flex-end',
    margin: 'auto 0 2px 4px',
    gap: '4px',
  }),
  bar: css.raw({
    backgroundColor: 'text.dark',
    width: '5px',
    borderRadius: '1px',
  }),
  sm: css.raw({
    height: '11px',
  }),
  md: css.raw({
    height: '14px',
  }),
  lg: css.raw({
    height: '19px',
  }),
  green: css.raw({
    backgroundColor: 'green',
  }),
  withSizeMedium: css.raw({
    alignItems: 'center',
  }),
  withRightAlign: css.raw({
    justifyContent: 'flex-end',
  }),
};
