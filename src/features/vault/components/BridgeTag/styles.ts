import { css } from '@repo/styles/css';

export const styles = {
  tag: css.raw({
    textStyle: 'subline.sm',
    fontWeight: 'bold',
    padding: '2px 8px',
    background: 'bayOfMany',
    color: 'text.middle',
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
    lineHeight: '24px',
    height: '24px',
    '&:hover': {
      background: 'blueJewel',
      cursor: 'pointer',
    },
  }),
  icon: css.raw({
    width: '16px',
    height: '16px',
    display: 'block',
  }),
  link: css.raw({
    color: 'colorPalette.text.link',
    textDecoration: 'underline',
  }),
};
