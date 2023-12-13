import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  holder: {
    position: 'absolute' as const,
    outline: 'none',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    [theme.breakpoints.down('xs')]: {
      padding: '0',
    },
  },
  card: {
    margin: 0,
    maxHeight: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    width: '1272px',
    maxWidth: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 24px',
    borderRadius: '10px 10px 0px 0px ',
    borderBottom: `2px solid ${theme.palette.background.contentLight}`,
  },
  title: {
    color: theme.palette.text.light,
  },
  closeIcon: {
    '&:hover': {
      background: 'none',
    },
  },
  content: {
    backgroundColor: theme.palette.background.contentPrimary,
    borderRadius: '0 0 12px 12px',
    padding: '24px',
    minHeight: '200px',
    flexShrink: 1,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  gridScroller: {
    flexShrink: 1,
    maxHeight: '100%',
    minHeight: '100px',
    overflowY: 'auto' as const,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    [theme.breakpoints.up('sm')]: {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
    [theme.breakpoints.up('md')]: {
      gridTemplateColumns: 'repeat(4, 1fr)',
    },
    [theme.breakpoints.up('lg')]: {
      gridTemplateColumns: 'repeat(5, 1fr)',
    },
  },
  closeButton: {
    marginTop: '32px',
  },
  chain: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px',
    borderRadius: '4px',
    backgroundColor: theme.palette.background.contentLight,
  },
  chainText: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.dark,
  },
  chainValue: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.middle,
  },
  chainLogo: {
    height: '32px',
    width: '32px',
    marginRight: '8px',
  },
});
