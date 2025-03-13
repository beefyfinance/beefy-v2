import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    display: 'flex',
    flexWrap: 'wrap',
    rowGap: '16px',
    borderRadius: '12px',
    backgroundColor: 'background.content.light',
    padding: '16px',
  }),
  text: css.raw({
    textStyle: 'body.medium',
    color: 'text.light',
    marginLeft: '8px',
  }),
  token: css.raw({
    display: 'flex',
    alignItems: 'center',
    flexGrow: '1',
  }),
  buttons: css.raw({
    display: 'flex',
    columnGap: '8px',
    rowGap: '8px',
    flexWrap: 'wrap',
  }),
  button: css.raw({
    textStyle: 'body',
    lineHeight: '0',
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: 'bayOfMany',
    borderColor: 'transparent',
    color: 'text.middle',
    '&:hover': {
      color: 'text.light',
      backgroundColor: 'blueJewel',
      borderColor: 'transparent',
      transition: 'color 0.1s',
    },
  }),
  icon: css.raw({
    marginLeft: '4px',
    '&:hover': {
      fill: 'text.light',
    },
  }),
};
