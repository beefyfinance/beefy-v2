import { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  itemsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '8px',
    width: '100%',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: '4px',
  },
  square: {
    width: '12px',
    height: '12px',
    borderRadius: '2px',
  },
  label: {
    ...theme.typography['body-sm-med'],
    color: '#D0D0DA',
    textTransform: 'uppercase' as const,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    maxWidth: '90%',
  },
  value: {
    ...theme.typography['body-sm'],
    color: '#999CB3',
  },
  flex: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
  },
});
