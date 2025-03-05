import { css } from '@repo/styles/css';

export const styles = {
  header: css.raw({
    sm: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    smDown: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '16px',
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
