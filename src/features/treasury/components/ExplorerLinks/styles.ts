import { css } from '@repo/styles/css';

export const styles = {
  icon: css.raw({
    height: '16px',
    width: '16px',
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
