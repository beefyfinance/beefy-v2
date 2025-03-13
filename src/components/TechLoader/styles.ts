import { css } from '@repo/styles/css';

export const styles = {
  fullscreen: css.raw({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    minHeight: '100vh',
    width: '100%',
  }),
  loader: css.raw({
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '1 1 auto',
  }),
  text: css.raw({
    textStyle: 'body.medium',
  }),
};
