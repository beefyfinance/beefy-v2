import { css } from '@repo/styles/css';

export const styles = {
  checkbox: css.raw({
    textStyle: 'body.medium',
    display: 'flex',
    alignItems: 'center',
    color: 'text.middle',
    cursor: 'pointer',
    columnGap: '4px',
    userSelect: 'none',
  }),
  icon: css.raw({
    color: 'text.dark',
  }),
  label: css.raw({
    display: 'flex',
    alignItems: 'center',
  }),
  checkedIcon: css.raw({
    color: 'text.light',
  }),
};
