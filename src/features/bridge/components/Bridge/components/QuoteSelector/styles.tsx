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

  scrollableThumb: {
    background: '#373B60',
  },
  scrollableTopShadow: {
    background: 'linear-gradient(0deg, rgba(46,49,80, 0) 0%, rgba(0, 0, 0, 0.5) 100%)',
  },
  scrollableBottomShadow: {
    background: 'linear-gradient(180deg, rgba(46,49,80, 0) 0%, rgba(0, 0, 0, 0.5) 100%)',
  },
  scrollableLeftShadow: {
    background: 'linear-gradient(270deg, rgba(46,49,80, 0) 0%, rgba(0, 0, 0, 0.5) 100%)',
  },
  scrollableRightShadow: {
    background: 'linear-gradient(90deg, rgba(46,49,80, 0) 0%, rgba(0, 0, 0, 0.5) 100%)',
  },
  quotes: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gap: '8px',
    padding: '8px',
    borderRadius: '8px',
    background: '#2E3150',
  },
  quote: {
    ...theme.typography['body-sm'],
    color: theme.palette.text.dark,
    border: 'none',
    background: '#373B60',
    boxShadow: 'none',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    margin: 0,
    padding: '8px 12px',
    borderRadius: '8px',
    whiteSpace: 'nowrap' as const,
    gap: '8px',
  },
  quoteButton: {
    cursor: 'pointer' as const,
    '&:hover, &:focus-visible': {
      color: '#fff',
    },
  },
  quoteLimited: {
    pointerEvents: 'none' as const,
    filter: 'grayscale(100)',
  },
  quoteProvider: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.middle,
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flex: '0 0 114px',
    [theme.breakpoints.down('sm')]: {
      flex: '0 0 24px',
    },
  },
  quoteProviderIcon: {
    display: 'block',
  },
  quoteProviderTitle: {
    display: 'block',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  quoteLimit: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flex: '1 0 142px',
  },
  quoteLimitIcon: {
    width: '16px',
    height: '16px',
    fill: theme.palette.text.light,
  },
  quoteFee: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flex: '0 0 142px',
  },
  quoteFeeIcon: {
    width: '16px',
    height: '16px',
    fill: theme.palette.text.light,
  },
  quoteTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flex: '0 0 50px',
  },
  quoteTimeIcon: {
    width: '16px',
    height: '16px',
    fill: theme.palette.text.light,
  },
  quoteButtonSelected: {
    background: '#232741',
    color: theme.palette.text.light,
    cursor: 'default' as const,
    pointerEvents: 'none' as const,
    '&:hover, &:focus-visible': {
      background: '#232741',
    },
  },
});
