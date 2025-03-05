import { css } from '@repo/styles/css';

export const styles = {
  shareButton: css.raw({
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    outline: 'none',
    '&:focus-visible, &.active': {
      outline: 'none',
      backgroundColor: 'bayOfMany',
    },
    lgDown: {
      padding: '10px',
    },
  }),
  icon: css.raw({
    flexShrink: '0',
    flexGrow: '0',
    fontSize: '16px',
  }),
  iconHolder: css.raw({
    height: '24px',
    width: '24px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'bayOfMany',
    lg: {
      height: '16px',
      width: '16px',
      backgroundColor: 'transparent',
    },
  }),
};
