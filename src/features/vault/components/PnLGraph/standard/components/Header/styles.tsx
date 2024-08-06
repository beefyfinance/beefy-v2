import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  header: {
    display: 'grid',
    gap: '1px',
    gridTemplateColumns: 'repeat(4, 1fr)',
    [theme.breakpoints.down('xs')]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
  },
  itemContainer: {
    display: 'flex',
    width: '100%',
    columnGap: '24px',
    padding: '16px 24px',
    backgroundColor: theme.palette.background.contentPrimary,
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    width: '95%',
  },
  label: {
    ...theme.typography['body-sm-med'],
    fontWeight: 700,
    color: theme.palette.text.dark,
    textTransform: 'uppercase' as const,
  },
  value: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '4px',
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.middle,
    fontWeight: 500,
    '& span': {
      textDecoration: 'none',
      ...theme.typography['subline-sm'],
      color: theme.palette.text.dark,
      fontWeight: 700,
    },
  },
  greenValue: {
    color: theme.palette.primary.main,
  },
  subValue: {
    ...theme.typography['body-sm-med'],
    color: theme.palette.text.dark,
  },
  withTooltip: {
    textDecoration: 'underline 1px dotted',
    cursor: 'default' as const,
  },
  textOverflow: {
    overflow: 'hidden',
    whiteSpace: 'nowrap' as const,
    textOverflow: 'ellipsis',
  },
  labelContainer: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '4px',
    '& svg': {
      color: theme.palette.text.dark,
      height: '16px',
      width: '16px',
      '&:hover': {
        cursor: 'pointer',
      },
    },
  },
  center: {
    display: 'flex',
    alignItems: 'center',
  },
  alignMobileRight: {
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      justifyContent: 'flex-end',
      '& $value': {
        justifyContent: 'flex-end',
      },
      '& $labelContainer': {
        justifyContent: 'flex-end',
      },
      '& $subValue': {
        textAlign: 'right',
      },
    },
  },
});
