import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flex: '1 1 auto',
    height: '100%',
    flexDirection: 'column' as const,
    borderRadius: '8px',
  },
  quotesHolder: {
    display: 'flex',
    flex: '1 1 auto',
    height: '100%',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  quotesTitle: {
    ...theme.typography['subline-sm'],
    fontWeight: 700,
    color: theme.palette.text.disabled,
  },
  scrollable: {
    flex: '1 0 auto',
    background: '#111321',
    borderRadius: '8px',
    '& > div': {
      borderRadius: 'inherit',
    },
  },
  scrollableThumb: {
    background: '#363B63',
  },
  scrollableTopShadow: {
    background: 'linear-gradient(0deg, rgba(17, 19, 33, 0) 0%, #000 100%)',
  },
  scrollableBottomShadow: {
    background: 'linear-gradient(180deg, rgba(17, 19, 33, 0) 0%, #000 100%)',
  },
  scrollableLeftShadow: {
    background: 'linear-gradient(270deg, rgba(17, 19, 33, 0) 0%, #000 100%)',
  },
  scrollableRightShadow: {
    background: 'linear-gradient(90deg, rgba(17, 19, 33, 0) 0%, #000 100%)',
  },
  quotes: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    // paddingBottom: '400px',
    borderRadius: '8px',
  },
  quote: {
    ...theme.typography['body-lg-med'],
    color: '#999CB3',
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    margin: 0,
    padding: '8px 16px',
    borderRadius: '8px',
    whiteSpace: 'nowrap' as const,
    gap: '16px',
  },
  quoteButton: {
    cursor: 'pointer' as const,
    '&:hover, &:focus-visible': {
      background: 'rgba(89,166,98,0.1)',
      color: '#fff',
    },
  },
  quoteProvider: {},
  quoteProviderIcon: {
    display: 'block',
  },
  quoteFee: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  quoteFeeIcon: {
    width: '24px',
    height: '24px',
    fill: '#fff',
  },
  quoteGas: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  quoteGasIcon: {
    width: '24px',
    height: '24px',
    fill: '#fff',
  },
  quoteTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  quoteTimeIcon: {
    width: '24px',
    height: '24px',
    fill: '#fff',
  },
  quoteButtonSelected: {
    background: '#59A662',
    color: '#fff',
    cursor: 'default' as const,
    pointerEvents: 'none' as const,
    '&:hover, &:focus-visible': {
      background: '#59A662',
    },
  },
});
