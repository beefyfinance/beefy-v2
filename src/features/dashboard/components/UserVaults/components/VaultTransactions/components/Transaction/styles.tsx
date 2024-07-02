import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  stat: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.middle,
    overflow: 'hidden',
    whiteSpace: 'nowrap' as const,
    textOverflow: 'ellipsis',
    maxWidth: '80%',
    display: 'flex',
    alignItems: 'center',
  },
  column: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  textFlexStart: {
    textAlign: 'left' as const,
  },
  gridMobile: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,minmax(0, 50fr))',
    columnGap: '8px',
    position: 'relative' as const,
    alignItems: 'start',
  },
  statMobile: {
    ...theme.typography['body-sm'],
    color: theme.palette.text.middle,
  },
  action: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.middle,
  },
  actionMobile: {
    ...theme.typography['body-sm'],
  },
  network: {
    display: 'block',
    marginRight: '8px',
  },
  link: {
    color: 'inherit',
    textDecoration: 'none',
    display: 'block',
  },
  textRed: {
    color: theme.palette.background.indicators.error,
  },
  textGreen: {
    color: theme.palette.primary.main,
  },
  textDark: {
    color: theme.palette.text.dark,
  },
  textOverflow: {
    flexDirection: 'row-reverse' as const,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    flexShrink: 1,
  },
  vaultNetwork: {
    top: 0,
    left: 0,
    width: '20px',
    height: '22px',
    border: 'none',
    borderBottomRightRadius: '16px',
    '& img': {
      width: '16px',
      height: '16px',
    },
  },
  cowcentratedTokenAmounts: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  tokenIconAmount: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.middle,
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  tokenIcon: {
    flex: '0 0 auto',
  },
  tokenAmount: {
    flex: '1 1 50%',
  },
  tokenIconAmountMobile: {
    ...theme.typography['body-sm'],
  },
  tokenIconAmountPositive: {
    color: theme.palette.primary.main,
  },
  tokenIconAmountNegative: {
    color: theme.palette.background.indicators.error,
  },
});
