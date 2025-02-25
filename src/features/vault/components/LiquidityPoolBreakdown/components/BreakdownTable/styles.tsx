import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  table: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    justifyContent: 'center',
    background: theme.palette.background.contentPrimary,
    borderBottomLeftRadius: '8px',
    borderBottomRightRadius: '8px',
    [theme.breakpoints.up('lg')]: {
      borderBottomLeftRadius: 0,
    },
  },
  cell: {
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  row: {
    backgroundColor: theme.palette.background.contentPrimary,
    display: 'grid',
    gridTemplateColumns: '35fr 35fr 30fr',
    padding: '16px 24px',
    borderBottom: `solid 2px ${theme.palette.background.border}`,
    alignItems: 'center',
    columnGap: '16px',
    '&:last-child': {
      borderBottom: 0,
    },
    '& $cell:nth-child(2), & $cell:nth-child(3)': {
      textAlign: 'right' as const,
    },
    [theme.breakpoints.down('sm')]: {
      padding: '16px',
    },
  },
  header: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.dark,
  },
  footer: {
    backgroundColor: theme.palette.background.contentLight,
    borderBottomLeftRadius: '8px',
    borderBottomRightRadius: '8px',
    [theme.breakpoints.up('lg')]: {
      borderBottomLeftRadius: 0,
    },
  },
  asset: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    width: '32px',
    height: '32px',
    marginRight: '8px',
  },
  tokenAmount: {
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'block',
    width: 'min-content',
    maxWidth: '100%',
    marginLeft: 'auto',
  },
});
