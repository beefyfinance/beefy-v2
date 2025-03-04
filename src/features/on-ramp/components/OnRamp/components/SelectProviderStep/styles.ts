import { css } from '@repo/styles/css';

export const styles = {
  icon: css.raw({
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    marginRight: '8px',
  }),
  iconLoading: css.raw({
    background: 'whiteo11;',
  }),
  iconProvider: css.raw({
    background: 'red',
  }),
  provider: css.raw({
    marginRight: '8px',
  }),
  rate: css.raw({
    textStyle: 'body.sm',
    color: 'text.dark',
    marginRight: '8px',
  }),
  arrow: css.raw({
    marginLeft: 'auto',
    color: 'text.middle',
    height: '24px',
  }),
};
