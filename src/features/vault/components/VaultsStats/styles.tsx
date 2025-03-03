import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  boxes: {
    display: 'grid',
    gridTemplateColumns: '100%',
    gap: '24px',
    [theme.breakpoints.up('lg')]: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,666fr) minmax(0,333fr)',
    },
    [theme.breakpoints.down('sm')]: {
      gap: '12px',
    },
  },
  stats: {
    display: 'grid',
    minHeight: '96px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
    backgroundColor: theme.palette.background.contentDark,
    borderRadius: '8px',
    padding: '16px',
    columnGap: '48px',
    [theme.breakpoints.up('lg')]: {
      padding: '16px 24px',
    },
  },
  statsInterest: {
    '& $stat': {
      textAlign: 'left' as const,
      '& *': {
        textAlign: 'left' as const,
      },
    },
  },
  statsDeposit: {
    '& $stat *': {
      textAlign: 'left' as const,
    },
    [theme.breakpoints.up('lg')]: {
      '& $stat': {
        textAlign: 'right' as const,
        '& *': {
          textAlign: 'right' as const,
          justifyContent: 'flex-end' as const,
        },
      },
    },
  },
  stat: {
    position: 'relative' as const,
    '&::before': {
      content: '""',
      position: 'absolute' as const,
      display: 'block' as const,
      background: theme.palette.background.border,
      width: '2px',
      height: '100%',
      left: -25,
      top: 0,
    },
    '&:first-child::before': {
      content: 'none',
      display: 'none',
    },
  },
});
