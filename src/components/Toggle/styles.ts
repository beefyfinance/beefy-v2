import { css } from '@repo/styles/css';

export const styles = {
  label: css.raw({
    textStyle: 'subline.sm',
    position: 'relative',
    color: 'text.dark',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  }),
  input: css.raw({
    position: 'absolute',
    opacity: '0',
    overflow: 'hidden',
    height: '0',
    width: '0',
  }),
  channel: css.raw({
    position: 'relative',
    background: 'background.content.dark',
    width: '44px',
    height: '24px',
    borderRadius: '40px',
  }),
  dot: css.raw({
    position: 'absolute',
    top: '2px',
    left: '2px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: 'background.content.light',
    transition: 'background-color 0.4s ease, left 0.4s ease',
  }),
  dotChecked: css.raw({
    backgroundColor: 'green',
    left: '22px',
  }),
};
