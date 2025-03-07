import { css } from '@repo/styles/css';

export const styles = {
  graphContainer: css.raw({
    padding: '16px 0px',
    backgroundColor: 'background.content',
    '& text': {
      textStyle: 'subline.sm',
      fill: 'text.dark',
      '&.recharts-cartesian-axis-tick-value': {
        textTransform: 'initial',
      },
    },
  }),
  graph: css.raw({
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
};
