import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
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
  },
});

export const itemStyles = (theme: Theme) => ({
  item: {
    ...theme.typography['body-lg-med'],
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    color: '#999CB3',
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    userSelect: 'none' as const,
    outline: 'none',
    '&:hover, &:focus-visible': {
      color: '#D0D0DA',
      '& $arrow': {
        color: '#fff',
      },
    },
  },
  arrow: {
    color: '#D0D0DA',
    height: '24px',
  },
  marginWithEndAdornement: {
    marginRight: '8px',
  },
  endAdornement: {
    marginLeft: 'auto',
    display: 'flex',
  },
});
