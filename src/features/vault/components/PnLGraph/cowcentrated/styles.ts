import { css } from '@repo/styles/css';

export const styles = {
  card: css.raw({
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  }),
  content: css.raw({
    padding: '0px',
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    sm: {
      padding: 0,
    },
  }),
  graphContainer: css.raw({
    backgroundColor: 'background.content',
    '&:last-child': {
      borderRadius: '0px 0px 12px 12px',
    },
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
  dashboardPnlContainer: css.raw({
    backgroundColor: 'background.content',
    borderRadius: '12px',
    mdDown: {
      borderRadius: '0px',
    },
  }),
  footerDashboard: css.raw({
    borderTop: '2px solid {colors.bayOfMany}',
  }),
};
