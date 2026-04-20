import { css } from '@repo/styles/css';

export const styles = {
  button: css.raw({
    paddingBlock: '6px',
    paddingInline: '6px 10px',
    margin: '0',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    background: 'background.content.dark',
    borderRadius: '18px 6px 6px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    pointerEvents: 'none',
  }),
  buttonForceSelection: css.raw({
    paddingInline: '16px 10px',
    borderRadius: '6px',
    color: 'text.dark',
    cursor: 'pointer',
    pointerEvents: 'auto',
    '& svg': {
      fill: 'text.dark',
    },
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
  iconMore: css.raw({
    width: '20px',
    height: '20px',
    flexShrink: '0',
    flexGrow: '0',
    fill: 'text.light',
  }),
  select: css.raw({
    textStyle: 'body.medium',
    color: 'text.light',
    display: 'flex',
    columnGap: '10px',
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
    color: 'text.light',
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  }),
  forceSelection: css.raw({
    color: 'inherit',
  }),
};
