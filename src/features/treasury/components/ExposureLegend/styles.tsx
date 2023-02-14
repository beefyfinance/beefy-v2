import { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  legendContainer: {
    display: 'flex',
    columnGap: '32px',
    flexWrap: 'wrap' as const,
    rowGap: '8px',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column' as const,
      columnGap: '16px',
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
    [theme.breakpoints.down('xs')]: {
      width: '14px',
    },
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
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      columnGap: '8px',
      '& span': {
        marginLeft: '0px',
      },
    },
  },
  uppercase: {
    textTransform: 'uppercase' as const,
  },
});
