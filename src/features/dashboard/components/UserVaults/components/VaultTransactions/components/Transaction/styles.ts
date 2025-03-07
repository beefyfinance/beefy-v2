import { css } from '@repo/styles/css';

export const styles = {
  stat: css.raw({
    textStyle: 'body.medium',
    color: 'text.middle',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    maxWidth: '80%',
    display: 'flex',
    alignItems: 'center',
  }),
  column: css.raw({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  }),
  textFlexStart: css.raw({
    textAlign: 'left',
  }),
  txPast: css.raw({
    opacity: '0.7',
  }),
  gridMobile: css.raw({
    display: 'grid',
    gridTemplateColumns: 'repeat(2,minmax(0, 50fr))',
    columnGap: '8px',
    position: 'relative',
    alignItems: 'start',
  }),
  statMobile: css.raw({
    textStyle: 'body.sm',
    color: 'text.middle',
  }),
  action: css.raw({
    textStyle: 'body.medium',
    color: 'text.middle',
  }),
  actionMobile: css.raw({
    textStyle: 'body.sm',
  }),
  network: css.raw({
    display: 'block',
    marginRight: '8px',
  }),
  link: css.raw({
    color: 'inherit',
    textDecoration: 'none',
    display: 'block',
  }),
  textRed: css.raw({
    color: 'indicators.error',
  }),
  textGreen: css.raw({
    color: 'green',
  }),
  textDark: css.raw({
    color: 'text.dark',
  }),
  textOverflow: css.raw({
    flexDirection: 'row-reverse',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    flexShrink: '1',
  }),
  vaultNetwork: css.raw({
    top: '0',
    left: '0',
    width: '20px',
    height: '22px',
    border: 'none',
    borderBottomRightRadius: '16px',
    '& img': {
      width: '16px',
      height: '16px',
    },
  }),
  cowcentratedTokenAmounts: css.raw({
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  }),
  tokenIconAmount: css.raw({
    textStyle: 'body.medium',
    color: 'text.middle',
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  }),
  tokenIcon: css.raw({
    flex: '0 0 auto',
  }),
  tokenAmount: css.raw({
    flex: '1 1 50%',
  }),
  tokenIconAmountMobile: css.raw({
    textStyle: 'body.sm',
  }),
  tokenIconAmountPositive: css.raw({
    color: 'green',
  }),
  tokenIconAmountNegative: css.raw({
    color: 'indicators.error',
  }),
};
