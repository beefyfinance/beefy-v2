import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  }),
  rewards: css.raw({
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: 'background.content.light',
    borderRadius: '8px',
    padding: '12px',
  }),
  titleHolder: css.raw({
    textStyle: 'subline.sm',
    color: 'text.dark',
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
  }),
  title: css.raw({
    flex: '1 1 auto',
  }),
  refresh: css.raw({
    flex: '0 0 auto',
  }),
};
