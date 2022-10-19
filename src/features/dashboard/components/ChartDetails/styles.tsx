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
  },
  square: {
    width: '12px',
    height: '12px',
    borderRadius: '2px',
  },
  label: {
    ...theme.typography['body-sm-med'],
    color: '#D0D0DA',
    flexGrow: 1,
    marginLeft: '8px',
    textTransform: 'uppercase' as const,
  },
  value: {
    ...theme.typography['body-sm'],
    color: '#999CB3',
  },
});
