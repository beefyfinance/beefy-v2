import { css } from '@repo/styles/css';

export const styles = {
  label: css.raw({
    display: 'flex',
    alignItems: 'center',
  }),
  labelText: css.raw({
    textStyle: 'subline.sm',
    color: 'text.dark',
  }),
  tooltipTrigger: css.raw({
    width: '16px',
    height: '16px',
    flexShrink: '0',
    marginLeft: '4px',
    '& svg': {
      width: '16px',
      height: '16px',
    },
  }),
  subValue: css.raw({
    textStyle: 'body.sm',
    color: 'text.dark',
  }),
  blurValue: css.raw({
    filter: 'blur(.5rem)',
  }),
  boostedValue: css.raw({
    color: 'background.vaults.boost',
  }),
  lineThroughValue: css.raw({
    textDecoration: 'line-through',
  }),
};
