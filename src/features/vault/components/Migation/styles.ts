import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '12px',
    backgroundColor: 'background.content',
  }),
  header: css.raw({
    display: 'flex',
    alignItems: 'center',
    columnGap: '16px',
    backgroundColor: 'background.content.dark',
    borderRadius: '12px 12px 0px 0px ',
    padding: '16px',
    sm: {
      padding: '24px',
    },
  }),
  icon: css.raw({
    height: '48px',
  }),
  subTitle: css.raw({
    textStyle: 'subline',
    fontWeight: 'bold',
    color: 'text.dark',
  }),
  title: css.raw({
    textStyle: 'h3',
    fontWeight: 'medium',
    color: 'text.light',
  }),
  content: css.raw({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '16px',
    rowGap: '16px',
    sm: {
      padding: '24px',
    },
  }),
};
