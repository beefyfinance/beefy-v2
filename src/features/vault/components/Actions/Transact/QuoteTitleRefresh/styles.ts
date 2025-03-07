import { css } from '@repo/styles/css';

export const AUTO_REFRESH_SECONDS = 15;

export const styles = {
  holder: css.raw({
    display: 'flex',
    gap: '16px',
    marginBottom: '8px',
  }),
  title: css.raw({
    textStyle: 'body',
    color: 'text.dark',
  }),
  refreshButton: css.raw({
    padding: '0',
    margin: '0 0 0 auto',
    flexShrink: '0',
    flexGrow: '0',
    background: 'transparent',
    boxShadow: 'none',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    lineHeight: '1',
    width: '24px',
    height: '24px',
    position: 'relative',
  }),
  refreshIcon: css.raw({
    width: '24px',
    height: '24px',
    fill: 'green',
    position: 'relative',
  }),
};
