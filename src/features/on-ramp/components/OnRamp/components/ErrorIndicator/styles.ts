import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  }),
  circle: css.raw({
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'alertErrorbackground',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  icon: css.raw({
    color: 'indicators.error',
    fontSize: '30px',
  }),
  title: css.raw({
    textStyle: 'h3',
    color: 'text.light',
    marginTop: '24px',
  }),
  content: css.raw({
    textStyle: 'body',
    color: 'text.middle',
    marginTop: '24px',
  }),
};
