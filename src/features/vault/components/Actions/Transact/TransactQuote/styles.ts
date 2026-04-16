import { css } from '@repo/styles/css';

export const styles = {
  divider: css.raw({
    marginBottom: '16px',
  }),
  tokenAmounts: css.raw({
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
  }),
  route: css.raw({
    marginTop: '24px',
  }),
  slippage: css.raw({
    marginTop: '24px',
  }),
  youReceiveSection: css.raw({
    marginTop: '24px',
  }),
  youReceiveTitle: css.raw({
    textStyle: 'body',
    color: 'text.dark',
    marginBottom: '8px',
  }),
  youReceiveCard: css.raw({
    background: 'background.content.light',
    borderRadius: '8px',
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  }),
  youReceiveDivider: css.raw({
    height: '1px',
    background: 'background.border',
    border: 'none',
    margin: '0',
  }),
  dustToggle: css.raw({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '4px 0',
    margin: '0',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    outline: 'none',
    color: 'text.dark',
    transition: 'color 0.2s',
    '&:hover': {
      color: 'text.light',
    },
  }),
  dustToggleLabel: css.raw({
    textStyle: 'body.md',
    color: 'inherit',
  }),
  dustToggleChevron: css.raw({
    display: 'flex',
    alignItems: 'center',
    color: 'inherit',
    '& svg': {
      width: '20px',
      height: '20px',
      fill: 'currentColor',
    },
  }),
  dustRows: css.raw({
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  }),
  dustRow: css.raw({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '44px',
  }),
  dustRowAmountGroup: css.raw({
    display: 'flex',
    flexDirection: 'column',
  }),
  dustRowTokenInfo: css.raw({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }),
  dustRowTokenName: css.raw({
    textStyle: 'body.medium',
    color: 'text.light',
  }),
  dustRowAmount: css.raw({
    textStyle: 'body.md.medium',
    color: 'text.light',
  }),
  dustRowValue: css.raw({
    textStyle: 'body.sm',
    color: 'text.dark',
  }),
  totalRow: css.raw({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 0',
  }),
  totalLabel: css.raw({
    textStyle: 'body.medium',
    color: 'text.light',
  }),
  totalValue: css.raw({
    textStyle: 'body.medium',
    color: 'text.light',
  }),
  disabled: css.raw({
    opacity: '40%',
    pointerEvents: 'none',
  }),
  cowcentratedDepositContainer: css.raw({
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  }),
  cowcentratedSharesDepositContainer: css.raw({
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  }),
  amountReturned: css.raw({
    display: 'flex',
    gap: '2px',
    alignItems: 'center',
    justifyContent: 'space-between',
  }),
  mainLp: css.raw({
    borderRadius: '8px 8px 0px 0px',
  }),
  fullWidth: css.raw({
    width: '100%',
    flexDirection: 'row-reverse',
    backgroundColor: 'background.content.dark',
  }),
  borderRadiusToken0: css.raw({
    borderRadius: '0px 0px 0px 8px',
  }),
  borderRadiusToken1: css.raw({
    borderRadius: '0px 0px 8px 0px',
  }),
  label: css.raw({
    textStyle: 'body',
    color: 'text.dark',
  }),
  alignItemsEnd: css.raw({
    alignItems: 'flex-end',
  }),
  link: css.raw({
    color: 'text.lightest',
    textDecoration: 'underline',
  }),
};
