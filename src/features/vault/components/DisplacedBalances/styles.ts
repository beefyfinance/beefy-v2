import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  }),
  entries: css.raw({
    textStyle: 'body',
    color: 'text.middle',
    padding: '16px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    background: 'background.content',
  }),
  entry: css.raw({
    display: 'flex',
    gap: '8px',
  }),
  icon: css.raw({
    width: '24px',
    height: '24px',
    flexGrow: '0',
    flexShrink: '0',
  }),
  text: css.raw({
    flexGrow: '1',
    flexShrink: '1',
  }),
  tokenAmount: css.raw({
    fontWeight: 'medium',
    color: 'text.boosted',
  }),
  link: css.raw({
    textDecoration: 'none',
    color: 'green',
  }),
};
