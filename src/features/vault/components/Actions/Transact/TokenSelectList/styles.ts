import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    padding: '24px 0 0 0',
    height: '469px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '0 0 12px 12px',
    overflow: 'hidden',
  }),
  search: css.raw({
    padding: '0 24px',
    margin: '0 0 24px 0',
  }),
  chainSelector: css.raw({
    padding: '0 24px',
    margin: '0 0 16px 0',
  }),
  walletToggle: css.raw({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
    padding: '0 24px',
    margin: '0 0 16px 0',
  }),
  inWallet: css.raw({
    textStyle: 'body',
    color: 'text.dark',
  }),
  hideDust: css.raw({
    textAlign: 'right',
  }),
  listContainer: css.raw({
    flexGrow: '1',
    height: '100%',
  }),
  list: css.raw({
    padding: '0 24px 24px 24px',
    minHeight: '100px',
    display: 'flex',
    flexDirection: 'column',
    rowGap: '16px',
    overflowY: 'auto',
  }),
  noResults: css.raw({
    padding: '8px 12px',
    borderRadius: '8px',
    background: 'background.content.light',
  }),
  buildLp: css.raw({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'background.content.light',
    borderRadius: '0px 0px 8px 8px',
    padding: '16px 24px',
    textDecoration: 'none',
  }),
  buildLpContent: css.raw({
    textStyle: 'body.medium',
    color: 'text.middle',
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
    flex: '1',
    textDecoration: 'none',
  }),
  icon: css.raw({
    color: 'text.middle',
  }),
};
