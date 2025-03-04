import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    display: 'flex',
    flexDirection: 'column',
    flex: '1 0 auto',
    gap: '16px',
  }),
  inputs: css.raw({
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    flex: '1 0 auto',
  }),
  footer: css.raw({
    marginTop: 'auto',
  }),
};
