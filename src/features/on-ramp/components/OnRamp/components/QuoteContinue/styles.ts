import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    rowGap: '24px',
  }),
  arrow: css.raw({
    color: 'text.dark',
    height: '24px',
  }),
};
