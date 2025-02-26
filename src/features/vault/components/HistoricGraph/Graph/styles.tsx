import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  chartContainer: {
    padding: '16px 0px',
    [theme.breakpoints.down('md')]: {
      padding: '16px 0px',
    },
  },
  graph: {
    '& text': {
      ...theme.typography['subline-sm'],
      fill: theme.palette.text.dark,
    },
    '& .recharts-yAxis': {
      '& .recharts-cartesian-axis-tick': {
        opacity: 1,
        transition: 'ease-in-out 0.5s',
      },
    },
    '&:hover': {
      '& .recharts-yAxis': {
        '& .recharts-cartesian-axis-tick': {
          opacity: 0.5,
          transition: 'ease-in-out 0.5s',
        },
      },
    },
  },
  cowcentratedHeader: {
    display: 'grid',
    gap: '1px',
    gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
  },
  cowcentratedStat: {
    backgroundColor: theme.palette.background.contentPrimary,
    padding: '16px 24px',
    [theme.breakpoints.down('sm')]: {
      padding: '16px',
    },
  },
  label: {
    ...theme.typography['body-sm-med'],
    fontWeight: 700,
    color: theme.palette.text.dark,
    textTransform: 'uppercase' as const,
  },
  inRange: {
    color: theme.palette.primary.main,
  },
  outOfRange: {
    color: theme.palette.background.buttons.boost,
  },
  value: {
    ...theme.typography['body-lg-med'],
    fontWeight: 500,
    color: theme.palette.text.primary,
    '& span': {
      ...theme.typography['body-sm-med'],
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      color: theme.palette.text.dark,
    },
  },
  roundBottomLeft: {
    borderBottomLeftRadius: '8px',
  },
  roundBottomRight: {
    borderBottomRightRadius: '8px',
  },
});
