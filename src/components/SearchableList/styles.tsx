import type { Theme } from '@material-ui/core';

export const styles = () => ({
  searchableList: {
    display: 'grid',
    gridTemplateColumns: 'auto',
    gridTemplateRows: 'auto minmax(0,1fr)',
    flexDirection: 'column' as const,
    width: 'calc(100% + 48px)',
    height: 'calc(100% + 24px)',
    margin: '0 -24px -24px -24px',
    rowGap: '24px',
  },
  search: {
    padding: '0 24px',
  },
  list: {
    padding: '0 24px 24px 24px',
    minHeight: '100px',
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '16px',
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
  },
  searchableListSM: {
    width: 'calc(100% + 24px)',
    height: 'calc(100% + 12px)',
    margin: '0 -12px -12px -12px',
  },
  searchSM: {
    padding: '0 12px',
  },
  listSM: {
    padding: '0 12px 12px 12px',
  },
});

export const itemStyles = (theme: Theme) => ({
  item: {
    ...theme.typography['body-lg-med'],
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    color: theme.palette.text.dark,
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    userSelect: 'none' as const,
    outline: 'none',
    '&:hover, &:focus-visible': {
      color: theme.palette.text.middle,
      '& $arrow': {
        color: '#fff',
      },
    },
  },
  arrow: {
    color: theme.palette.text.middle,
    height: '24px',
  },
  marginWithendAdornment: {
    marginRight: '8px',
  },
  endAdornment: {
    marginLeft: 'auto',
    display: 'flex',
  },
});
