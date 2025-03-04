import { css } from '@repo/styles/css';

export const styles = {
  bar: css.raw({
    height: '12px',
    width: '100%',
    borderRadius: '80px',
    display: 'flex',
    opacity: '0',
    animation: 'fadeInOut 500ms ease-in-out forwards',
  }),
  barItem: css.raw({
    height: '100%',
    borderRight: '2px solid {colors.background.content}',
    '&:first-child': {
      borderRightRadius: '0px',
    },
    '&:last-child': {
      borderLeftRadius: '0px',
      borderRight: 'none',
    },
  }),
};
