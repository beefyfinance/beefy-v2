import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    backgroundColor: 'background.header',
    padding: '24px 0 48px 0',
    mdDown: {
      padding: '24px 0px',
    },
  }),
  titleContainer: css.raw({
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '24px',
    mdDown: {
      flexDirection: 'column',
      rowGap: '12px',
    },
  }),
  title: css.raw({
    display: 'flex',
    columnGap: '8px',
    alignItems: 'baseline',
    textStyle: 'h1',
  }),
};
