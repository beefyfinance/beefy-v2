import { css } from '@repo/styles/css';

export const styles = {
  pending: css.raw({
    position: 'absolute',
    left: '0',
    top: '0',
    padding: '8px 16px',
  }),
  icon: css.raw({
    background: 'transparent',
    padding: '0',
    border: '0',
    margin: '0 16px 0 0',
    boxShadow: 'none',
    lineHeight: 'inherit',
    display: 'flex',
    alignItems: 'center',
    color: 'text.middle',
    flexShrink: '0',
    width: '24px',
    height: '24px',
    'button&': {
      cursor: 'pointer',
    },
  }),
};
