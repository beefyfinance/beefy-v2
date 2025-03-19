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
