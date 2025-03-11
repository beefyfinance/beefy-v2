import { css } from '@repo/styles/css';

export const styles = {
  link: css.raw({
    display: 'inline-flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    textDecoration: 'none',
    color: 'text.middle',
    backgroundColor: 'bayOfMany',
    padding: '2px 8px',
    borderRadius: '4px',
    height: '28px',
    '&:hover': {
      color: 'text.light',
      backgroundColor: 'linkIconHoverBackground',
      transition: 'color 0.1s',
    },
  }),
  svgIcon: css.raw({
    width: '16px',
    height: '16px',
  }),
};
