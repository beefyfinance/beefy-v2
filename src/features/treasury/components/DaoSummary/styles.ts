import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    backgroundColor: 'background.header',
    padding: '24px 0 48px 0',
    mdDown: {
      padding: '24px 0 32px 0',
    },
  }),
  title: css.raw({
    textStyle: 'h1',
    marginBottom: '24px',
  }),
};
