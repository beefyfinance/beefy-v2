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
  sourceTitle: css.raw({
    textStyle: 'subline.sm',
    fontWeight: 'bold',
    color: 'colorPalette.text.title',
  }),
  rewards: css.raw({
    display: 'flex',
    flexDirection: 'column',
    rowGap: '4px',
  }),
  rewardsText: css.raw({
    textStyle: 'body.medium',
    color: 'colorPalette.text.item',
  }),
  usdPrice: css.raw({
    textStyle: 'subline.sm',
    fontWeight: 'bold',
    color: 'colorPalette.text.label',
  }),
};
