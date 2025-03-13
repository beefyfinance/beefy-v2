import { css } from '@repo/styles/css';

export const styles = {
  group: css.raw({
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  }),
  label: css.raw({
    textStyle: 'subline.sm',
    fontWeight: 'bold',
    color: 'inherit',
    flex: '1 1 40%',
  }),
  check: css.raw({
    color: 'inherit',
    fill: 'currentColor',
    width: '16px',
    height: '16px',
  }),
  checkedIcon: css.raw({
    color: 'inherit',
    fill: 'currentColor',
  }),
  input: css.raw({
    minHeight: '52px',
  }),
};
