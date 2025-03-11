import { css } from '@repo/styles/css';

export const styles = {
  summaryContainer: css.raw({
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    lgDown: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
  }),
  container: css.raw({
    width: '100%',
    display: 'flex',
    columnGap: '16px',
    padding: '16px',
    borderRadius: '8px',
    backgroundColor: 'purpleDarkest',
    alignItems: 'center',
    smDown: {
      columnGap: '8px',
      backgroundColor: 'transparent',
      padding: '0',
      alignItems: 'flex-start',
    },
  }),
  iconContainer: css.raw({
    borderRadius: '130px',
    backgroundColor: 'dashboardSummaryIconBackground',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '48px',
    width: '48px',
    smDown: {
      backgroundColor: 'transparent',
      height: '24px',
      width: '24px',
    },
  }),
  contentContainer: css.raw({
    display: 'flex',
    flexDirection: 'column',
  }),
  title: css.raw({
    textStyle: 'subline',
    fontWeight: 'bold',
    color: 'text.dark',
    smDown: {
      textStyle: 'body.sm',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
  }),
  value: css.raw({
    textStyle: 'h1',
    color: 'text.middle',
    smDown: {
      textStyle: 'body.medium',
    },
  }),
};
