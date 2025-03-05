import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    display: 'flex',
    alignItems: 'center',
    columnGap: '4px',
    textStyle: 'body.medium',
    color: 'text.middle',
  }),
  statuses: css.raw({
    display: 'flex',
    flexDirection: 'column',
    rowGap: '8px',
  }),
  sources: css.raw({
    display: 'flex',
    flexDirection: 'column',
    rowGap: '8px',
  }),
  source: css.raw({}),
  sourceTitle: css.raw({
    textStyle: 'subline.sm',
    fontWeight: 'bold',
    color: 'var(--tooltip-title-color)',
  }),
  rewards: css.raw({
    display: 'flex',
    flexDirection: 'column',
    rowGap: '4px',
  }),
  rewardsText: css.raw({
    textStyle: 'body.medium',
    color: 'var(--tooltip-value-color)',
  }),
  usdPrice: css.raw({
    textStyle: 'subline.sm',
    fontWeight: 'bold',
    color: 'var(--tooltip-label-color)',
  }),
};
