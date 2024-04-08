import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {},
  divider: {
    marginBottom: '16px',
  },
  tokenAmounts: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    width: '100%',
  },
  route: {
    marginTop: '24px',
  },
  slippage: {
    marginTop: '24px',
  },
  returned: {
    marginTop: '16px',
  },
  returnedTitle: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.dark,
    marginBottom: '8px',
  },
  disabled: {
    opacity: '40%',
    pointerEvents: 'none' as const,
  },
  cowcentratedDepositContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  cowcentratedSharesDepositContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  amountReturned: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainLp: {
    borderRadius: '8px 8px 0px 0px',
  },
  fullWidth: {
    width: '100%',
    flexDirection: 'row-reverse' as const,
    backgroundColor: theme.palette.background.contentDark,
  },
  borderRadiusToken0: {
    borderRadius: '0px 0px 0px 8px',
  },
  borderRadiusToken1: {
    borderRadius: '0px 0px 8px 0px',
  },
  label: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.dark,
  },
  alignItemsEnd: {
    alignItems: 'flex-end',
  },
});
