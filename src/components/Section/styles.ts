import { css } from '@repo/styles/css';

export const styles = {
  sectionContainer: css.raw({
    marginTop: '48px',
    mdDown: {
      marginTop: '24px',
    },
  }),
  titleContainer: css.raw({
    marginBottom: '24px',
  }),
  title: css.raw({
    textStyle: 'h3',
    color: 'text.middle',
  }),
  subTitle: css.raw({
    textStyle: 'body',
    color: 'text.dark',
    marginTop: '8px',
  }),
};
