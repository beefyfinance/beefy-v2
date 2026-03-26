import { css } from '@repo/styles/css';

export const styles = {
  button: css.raw({
    paddingBlock: '6px',
    paddingInline: '6px 10px',
    margin: '0',
    border: 'none',
    borderLeftRadius: '18px',
    boxShadow: 'none',
    outline: 'none',
    background: 'background.content.dark',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    pointerEvents: 'none',
  }),
  buttonForceSelection: css.raw({
    paddingInline: '16px 10px',
    borderLeftRadius: '6px',
    color: 'text.dark',
    cursor: 'pointer',
    pointerEvents: 'auto',
    '&:hover, &:focus-visible': {
      color: 'text.middle',
      '& svg': {
        fill: 'text.middle',
      },
    },
  }),
  buttonMore: css.raw({
    padding: '6px 6px 6px 12px',
    cursor: 'pointer',
    pointerEvents: 'auto',
  }),
  iconAssets: css.raw({
    width: '32px',
    height: '32px',
    flexShrink: '0',
    flexGrow: '0',
  }),
  iconMore: css.raw({
    flexShrink: '0',
    flexGrow: '0',
    fill: 'text.dark',
  }),
  select: css.raw({
    textStyle: 'body.medium',
    color: 'text.lightest',
    display: 'flex',
    columnGap: '8px',
    alignItems: 'center',
  }),
  zapIcon: css.raw({
    height: '24px',
    width: '24px',
    backgroundColor: 'background.content.light',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& img': {
      height: '18px',
    },
  }),
  breakLp: css.raw({
    textStyle: 'body.medium',
    color: 'text.lightest',
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  }),
  forceSelection: css.raw({
    color: 'inherit',
  }),
};
