import { css } from '@repo/styles/css';

export const styles = {
  timer: css.raw({
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    textAlign: 'center',
    justifyContent: 'center',
    height: 'body',
  }),
  icon: css.raw({
    position: 'absolute',
    left: '0',
  }),
};
