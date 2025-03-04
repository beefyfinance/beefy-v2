import { css } from '@repo/styles/css';

export const styles = {
  btnContainer: css.raw({
    display: 'flex',
    flexWrap: 'wrap',
    columnGap: '8px',
    rowGap: '8px',
  }),
  btnSecondary: css.raw({
    textStyle: 'body',
    textDecoration: 'none',
    color: 'text.middle',
    backgroundColor: 'bayOfMany',
    borderRadius: '4px',
    transition: 'color 0.2s',
    padding: '2px 8px',
    width: 'max-content',
    '&:hover': {
      color: 'text.light',
      backgroundColor: 'blueJewel',
      transition: 'color 0.1s',
    },
  }),
};
