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
    '&:hover': {
      color: 'text.light',
      backgroundColor: 'blueJewel',
      transition: 'color 0.1s',
    },
  }),
  icon: css.raw({
    fontSize: 'inherit',
    '&:first-child': {
      marginRight: '4px',
    },
    '&:last-child': {
      marginLeft: '4px',
    },
  }),
};
