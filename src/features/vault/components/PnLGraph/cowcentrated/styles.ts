import { css } from '@repo/styles/css';

export const styles = {
  header: css.raw({
    flexDirection: 'column',
    alignItems: 'flex-start',
    sm: {
      justifyContent: 'space-between',
      flexDirection: 'row',
    },
  }),
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
  tabsDashboard: css.raw({
    //FIXME MUI2PANDA: Target MUI class
    '& .MuiTab-root': {
      textStyle: 'subline.sm',
    },
  }),
  footerDashboard: css.raw({
    borderTop: '2px solid {colors.bayOfMany}',
  }),
};
