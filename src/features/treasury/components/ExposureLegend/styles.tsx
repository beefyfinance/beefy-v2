import { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  legendContainer: {
    display: 'flex',
    columnGap: '32px',
    [theme.breakpoints.down('md')]: {
      flexWrap: 'wrap',
      columnGap: '16px',
      rowGap: '8px',
    },
  },
  legendItem: {
    display: 'flex',
    columnGap: '8px',
    alignItems: 'center',
  },
  square: {
    height: '12px',
    width: '12px',
    borderRadius: '2px',
  },
  label: {
    ...theme.typography['body-sm-med'],
    color: '#D0D0DA',
    textTransform: 'capitalize' as const,
    '& span': {
      ...theme.typography['body-sm'],
      color: '#999CB3',
      marginLeft: '4px',
    },
  },
  uppercase: {
    textTransform: 'uppercase' as const,
  },
});
