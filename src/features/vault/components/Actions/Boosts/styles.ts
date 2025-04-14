import { css } from '@repo/styles/css';

export const styles = {
  containerBoost: css.raw({
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: 'background.content',
    display: 'flex',
    flexDirection: 'column',
    rowGap: '16px',
    sm: {
      padding: '24px',
    },
  }),
  containerExpired: css.raw({
    display: 'flex',
    flexDirection: 'column',
    rowGap: '16px',
    padding: '16px',
    backgroundColor: 'background.content',
    borderRadius: '12px',
    sm: {
      padding: '24px',
    },
  }),
  boostImg: css.raw({
    width: '30',
    height: '30',
    marginLeft: '-8px',
  }),
  title: css.raw({
    textStyle: 'h2',
    color: 'text.boosted',
    display: 'flex',
    alignItems: 'center',
  }),
  titleWhite: css.raw({
    color: 'text.lightest',
  }),
  titleTooltipTrigger: css.raw({
    color: 'text.middle',
    marginLeft: '8px',
  }),
  rewards: css.raw({
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    columnGap: '16px',
    backgroundColor: 'background.content.light',
    color: 'text.middle',
    padding: '12px',
    borderRadius: '8px',
  }),
  rewardLabel: css.raw({
    textStyle: 'subline.sm',
    color: 'text.dark',
    whiteSpace: 'nowrap',
  }),
  rewardValue: css.raw({
    textStyle: 'body.medium',
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    whiteSpace: 'nowrap',
  }),
  rewardsFadeInactive: css.raw({
    color: 'text.dark',
  }),
  rewardValueActive: css.raw({
    color: 'text.middle',
  }),
  rewardValueAmount: css.raw({
    minWidth: '0',
  }),
  rewardEllipsis: css.raw({
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
  rewardSymbol: css.raw({
    marginLeft: '4px',
  }),
  button: css.raw({
    borderRadius: '8px',
  }),
};
