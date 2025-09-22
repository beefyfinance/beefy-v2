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
  returned: css.raw({
    marginTop: '16px',
  }),
  returnedTitle: css.raw({
    textStyle: 'body',
    color: 'text.dark',
    marginBottom: '8px',
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
