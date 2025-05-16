import { css } from '@repo/styles/css';

export const styles = {
  checkbox: css.raw({
    textStyle: 'body.medium',
    display: 'flex',
    alignItems: 'center',
    color: 'text.dark',
    cursor: 'pointer',
    columnGap: '10px',
    userSelect: 'none',
    paddingBlock: '8px',
    width: '100%',
  }),
  endAdornment: css.raw({
    display: 'flex',
    alignItems: 'center',
    marginLeft: 'auto',
  }),
  icon: css.raw({
    color: 'text.dark',
  }),
  label: css.raw({
    display: 'flex',
    alignItems: 'center',
  }),
  checkedLabel: css.raw({
    color: 'text.light',
  }),
};
