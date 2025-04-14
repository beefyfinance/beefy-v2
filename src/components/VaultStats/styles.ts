import { css } from '@repo/styles/css';

export const styles = {
  vaultStats: css.raw({
    display: 'flex',
    flexGrow: '0',
    flexShrink: '0',
    flexDirection: 'column',
    justifyContent: 'center',
  }),
  row: css.raw({
    display: 'grid',
    width: '100%',
    columnGap: '24px',
    rowGap: '24px',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    sm: {
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    },
    md: {
      gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    },
  }),
  column: css.raw({
    width: '100%',
    lg: {
      textAlign: 'right',
    },
  }),
  valueWithIcon: css.raw({
    flexDirection: 'row',
    columnGap: '4px',
    alignItems: 'center',
  }),
  columnFlex: css.raw({
    display: 'flex',
    justifyContent: 'flex-end',
    columnGap: '4px',
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
  depositWithIcon: css.raw({
    display: 'flex',
    gap: '4px',
    justifyContent: 'flex-end',
    alignItems: 'center',
  }),
  depositIcon: css.raw({
    width: '20px',
    height: '20px',
    color: 'inherit',
  }),
  depositIconNotEarning: css.raw({
    color: 'text.boosted',
  }),
};
