import { styled } from '@repo/styles/jsx';

/** Padded chart box: tick text style, y ticks fade while hovering the chart */
export const ChartBox = styled('div', {
  base: {
    padding: '16px 0px',
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
  },
});
