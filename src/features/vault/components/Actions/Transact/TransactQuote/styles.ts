import { css } from '@repo/styles/css';

export const styles = {
  divider: css.raw({
    marginBottom: '16px',
  }),
  tokenAmounts: css.raw({
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
  }),
  route: css.raw({
    marginTop: '24px',
  }),
  slippage: css.raw({
    marginTop: '24px',
  }),
  youReceiveCard: css.raw({
    background: 'background.content.light',
    borderRadius: '8px',
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  }),
  dustToggle: css.raw({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '0',
    margin: '0',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    outline: 'none',
    color: 'text.dark',
    transition: 'color 0.2s',
    '&:hover': {
      color: 'text.light',
    },
  }),
  dustToggleLabel: css.raw({
    textStyle: 'body.md',
    color: 'inherit',
  }),
  dustToggleChevron: css.raw({
    display: 'flex',
    alignItems: 'center',
    color: 'inherit',
    '& svg': {
      width: '20px',
      height: '20px',
      fill: 'currentColor',
    },
  }),
  dustRows: css.raw({
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    // separates the rows from the toggle label, matching the spacing around dividers
    paddingTop: '4px',
  }),
  totalRow: css.raw({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  totalText: css.raw({
    textStyle: 'body.medium',
    color: 'text.light',
  }),
  disabled: css.raw({
    opacity: '40%',
    pointerEvents: 'none',
  }),
  amountReturned: css.raw({
    display: 'flex',
    gap: '2px',
    alignItems: 'center',
    justifyContent: 'space-between',
  }),
  fullWidth: css.raw({
    width: '100%',
    flexDirection: 'row-reverse',
    backgroundColor: 'background.content.dark',
  }),
  clmPositionGrid: css.raw({
    display: 'flex',
    alignItems: 'stretch',
  }),
  clmPositionCell: css.raw({
    flex: '1',
    minWidth: '0',
    gap: '8px',
  }),
  clmPositionCellDivider: css.raw({
    width: '1px',
    background: 'background.border',
    margin: '0 12px',
  }),
};
