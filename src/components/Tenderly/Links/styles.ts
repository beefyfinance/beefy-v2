import { css } from '@repo/styles/css';

export const styles = {
  link: css.raw({
    color: 'inherit',
    textDecoration: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    '&:hover': {
      textDecoration: 'underline',
    },
  }),
  icon: css.raw({
    width: '16',
    height: '16',
  }),
};
