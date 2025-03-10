import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    backgroundColor: 'background.content',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: '24px',
    borderRadius: '8px',
  }),
  icon: css.raw({
    width: '120px',
    height: '120px',
    md: {
      width: '132px',
      height: '132px',
    },
  }),
  textContainer: css.raw({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: '4px',
  }),
  title: css.raw({
    textStyle: 'h3',
    color: 'text.light',
    textAlign: 'center',
  }),
  text: css.raw({
    textStyle: 'body',
    color: 'text.middle',
    textAlign: 'center',
  }),
  actionsContainer: css.raw({
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '100%',
    gap: '12px',
  }),
  dividerContainer: css.raw({
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
    width: '272px',
  }),
  line: css.raw({
    height: '2px',
    width: '100%',
    backgroundColor: 'background.content.light',
    borderRadius: '8px',
  }),
  btn: css.raw({
    width: '100%',
    padding: '6px 12px',
    maxWidth: '272px',
  }),
  or: css.raw({
    textStyle: 'subline.sm',
    color: 'text.dark',
  }),
  center: css.raw({
    display: 'flex',
    justifyContent: 'center',
    textAlign: 'center',
  }),
  search: css.raw({
    backgroundColor: 'purpleDarkest',
  }),
};
