import { css } from '@repo/styles/css';

export const styles = {
  iframe: css.raw({
    display: 'block',
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: '12px',
    borderBottomRightRadius: '12px',
  }),
  iframeMtPellerin: css.raw({
    background: 'mtPellerin',
  }),
  error: css.raw({
    padding: '24px',
  }),
};
