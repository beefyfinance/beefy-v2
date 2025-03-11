import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    padding: '12',
    borderRadius: '8px',
    backgroundColor: 'background.content.light',
  }),
  title: css.raw({
    display: 'flex',
    textStyle: 'body',
    color: 'text.middle',
    alignItems: 'center',
    '&:hover': {
      cursor: 'pointer ',
    },
  }),
  iconButton: css.raw({
    padding: '0',
    '& .mui-icon': {
      fill: 'text.dark',
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
    marginRight: '4px',
  }),
  text: css.raw({
    textStyle: 'body',
    flexGrow: '1',
  }),
  balance: css.raw({
    textStyle: 'body.sm',
    color: 'text.dark',
    '& div': {
      color: 'text.middle',
    },
  }),
  actions: css.raw({
    display: 'flex',
    flexDirection: 'column',
    marginTop: '8px',
    rowGap: '16px',
  }),
  button: css.raw({
    '&:disabled': {
      borderColor: 'transparent',
    },
  }),
  maxButton: css.raw({
    textStyle: 'subline.sm',
    fontWeight: 'bold',
    padding: '4px 8px',
    borderRadius: '4px',
    backgroundColor: 'bayOfMany',
    borderColor: 'transparent',
    '&:disabled': {
      borderColor: 'transparent',
    },
  }),
};
