import type { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  legendContainer: {
    display: 'flex',
    columnGap: '32px',
    flexWrap: 'wrap' as const,
    rowGap: '8px',
    opacity: '0',
    animation: '$fadeInOut 500ms ease-in-out forwards',
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
    color: theme.palette.text.middle,
    textTransform: 'capitalize' as const,
    '& span': {
      ...theme.typography['body-sm'],
      color: theme.palette.text.dark,
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
  '@keyframes fadeInOut': {
    from: {
      opacity: '0',
    },
    to: {
      opacity: '1',
    },
  },
});
