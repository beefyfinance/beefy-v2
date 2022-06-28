import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  table: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    backgroundImage:
      'linear-gradient(to bottom, #2D3153 0%, #2D3153 50%, #363B63 50%, #363B63 100%)',
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
    backgroundColor: '#2D3153',
    display: 'grid',
    gridTemplateColumns: '35fr 35fr 30fr',
    padding: '16px 24px',
    borderBottom: 'solid 2px #363B63',
    alignItems: 'center',
    columnGap: '16px',
    '&:last-child': {
      borderBottom: 0,
    },
    '& $cell:nth-child(2), & $cell:nth-child(3)': {
      textAlign: 'right' as const,
    },
  },
  header: {
    ...theme.typography['subline-sm'],
    color: '#999CB3',
  },
  footer: {
    backgroundColor: '#363B63',
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
