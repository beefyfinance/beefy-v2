import { css } from '@repo/styles/css';

export const styles = {
  vaultStats: css.raw({
    display: 'flex',
    flexGrow: '0',
    flexShrink: '0',
    flexDirection: 'column',
    justifyContent: 'center',
  }),
  column: css.raw({
    width: '100%',
    lg: {
      textAlign: 'right',
    },
  }),
  hideMd: css.raw({
    display: 'none',
    lg: {
      display: 'block',
    },
  }),
  hideSm: css.raw({
    display: 'none',
    md: {
      display: 'block',
    },
  }),
  textGreen: css.raw({
    color: 'green',
  }),
  rowDashboard: css.raw({
    display: 'grid',
    width: '100%',
    gridTemplateColumns: 'minmax(0, 1fr)',
    columnGap: '8px',
    md: {
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    },
    lg: {
      gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    },
  }),
  columnDashboard: {
    marginLeft: 'auto',
    textAlign: 'right',
  },
  textOverflow: css.raw({
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  }),
  tooltipTrigger: css.raw({
    display: 'inline',
  }),
};
