import { css } from '@repo/styles/css';

export const styles = {
  link: css.raw({
    textDecoration: 'none',
  }),
  container: css.raw({
    backgroundColor: 'background.content.light',
    padding: '16px',
    borderRadius: '12px',
    '&:hover': {
      backgroundColor: 'bayOfMany',
    },
  }),
  title: css.raw({
    textStyle: 'body.medium',
    color: 'text.light',
    display: 'flex',
  }),
  icon: css.raw({
    height: '24px',
    width: '24px',
    marginRight: '8px',
  }),
  content: css.raw({
    marginTop: '16px',
    textStyle: 'body',
    color: 'text.middle',
  }),
};
