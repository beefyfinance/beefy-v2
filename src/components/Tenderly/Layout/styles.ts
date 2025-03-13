import { css } from '@repo/styles/css';

export const styles = {
  vertical: css.raw({
    display: 'flex',
    gap: '16px',
    flexDirection: 'column',
  }),
  horizontal: css.raw({
    display: 'flex',
    gap: '16px',
    flexDirection: 'row',
  }),
};
