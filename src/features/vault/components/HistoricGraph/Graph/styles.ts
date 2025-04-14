import { css } from '@repo/styles/css';

export const styles = {
  chartContainer: css.raw({
    padding: '16px 0px',
  }),
  graph: css.raw({
    '& text': {
      textStyle: 'subline.sm',
      fill: 'text.dark',
    },
    '& .recharts-yAxis': {
      '& .recharts-cartesian-axis-tick': {
        opacity: '1',
        transition: 'ease-in-out 0.5s',
      },
    },
    '&:hover': {
      '& .recharts-yAxis': {
        '& .recharts-cartesian-axis-tick': {
          opacity: '0.5',
          transition: 'ease-in-out 0.5s',
        },
      },
    },
  }),
  cowcentratedHeader: css.raw({
    display: 'grid',
    gap: '1px',
    gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
  }),
  cowcentratedStat: css.raw({
    backgroundColor: 'background.content',
    padding: '16px',
    sm: {
      padding: '16px 24px',
    },
  }),
  label: css.raw({
    textStyle: 'body.sm.medium',
    fontWeight: 'bold',
    color: 'text.dark',
    textTransform: 'uppercase',
  }),
  inRange: css.raw({
    color: 'green',
  }),
  outOfRange: css.raw({
    color: 'text.boosted',
  }),
  value: css.raw({
    textStyle: 'body.medium',
    fontWeight: 'medium',
    color: 'text.lightest',
    '& span': {
      textStyle: 'body.sm.medium',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      color: 'text.dark',
    },
  }),
  roundBottomLeft: css.raw({
    borderBottomLeftRadius: '8px',
  }),
  roundBottomRight: css.raw({
    borderBottomRightRadius: '8px',
  }),
};
