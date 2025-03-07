import { css } from '@repo/styles/css';

export const styles = {
  center: css.raw({
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      cursor: 'pointer',
    },
  }),
  icon: css.raw({
    height: '16px',
    width: '16px',
  }),
  dropdown: css.raw({
    display: 'flex',
    flexDirection: 'column',
    rowGap: '12px',
    padding: '6px',
    border: '2px solid extracted271',
    backgroundColor: 'extracted3248',
    borderRadius: '4px',
  }),
  item: css.raw({
    textStyle: 'body',
    fontWeight: 'medium',
    display: 'flex',
    alignItems: 'center',
    columnGap: '4px',
    color: 'text.middle',
    textDecoration: 'none',
    '& img': {
      height: '12px',
      width: '12px',
    },
    '&:hover': {
      cursor: 'pointer',
      color: 'text.light',
    },
  }),
};
