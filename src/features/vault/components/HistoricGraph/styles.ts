import { css } from '@repo/styles/css';

export const styles = {
  content: css.raw({
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    padding: '0',
    backgroundColor: 'transparent',
    sm: {
      padding: 0,
    },
  }),
  container: css.raw({
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  }),
};
