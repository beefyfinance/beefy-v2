import { css } from '@repo/styles/css';

export const styles = {
  priceWithChange: css.raw({
    textStyle: 'subline.sm',
    fontWeight: 'bold',
    padding: '4px 8px',
    background: 'bayOfMany',
    color: 'text.middle',
    display: 'inline-flex',
    alignItems: 'center',
    flexWrap: 'nowrap',
    whiteSpace: 'nowrap',
    gap: '4px',
    borderRadius: '4px',
    userSelect: 'none',
  }),
  tooltipTrigger: css.raw({
    cursor: 'pointer',
    '&:hover': {
      background: 'blueJewel',
      cursor: 'pointer',
    },
  }),
  change: css.raw({
    display: 'inline-flex',
    alignItems: 'center',
    flexWrap: 'nowrap',
    whiteSpace: 'nowrap',
    gap: '2px',
    fontSize: '0.8em',
    color: 'text.dark',
  }),
  positive: css.raw({
    color: 'changePositive',
  }),
  negative: css.raw({
    color: 'changeNegative',
  }),
};
