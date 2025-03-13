import { css } from '@repo/styles/css';

export const styles = {
  link: css.raw({
    textStyle: 'body',
    display: 'inline-flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '4px',
    textDecoration: 'none',
    color: 'text.light',
    backgroundColor: 'bayOfMany',
    padding: '2px 8px',
    borderRadius: '4px',
    '&:hover': {
      color: 'text.lightest',
      backgroundColor: 'blueJewel',
      transition: 'color 0.1s',
    },
  }),
  icon: css.raw({
    padding: '4px 0',
    height: '24px',
    width: '16px',
  }),
};
