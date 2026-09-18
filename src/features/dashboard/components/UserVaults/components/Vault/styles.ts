import { css } from '@repo/styles/css';

export const styles = {
  vaultRow: css.raw({
    minHeight: '102px',
  }),
  vault: css.raw({
    display: 'grid',
    position: 'relative',
    color: 'dashboardVaultText',
    background: 'background.content',
    padding: '24px 16px',
    textDecoration: 'none',
    '&:hover': {
      cursor: 'pointer',
    },
  }),
  vaultInner: css.raw({
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 40fr) minmax(0, 60fr)',
    columnGap: '8px',
    width: '100%',
    mdDown: {
      gridTemplateColumns: 'minmax(0, 80fr) minmax(0, 20fr)',
    },
  }),
  vaultEarnings: css.raw({
    backgroundColor: 'background.vaults.gov',
  }),
  vaultPaused: css.raw({
    backgroundColor: 'vaultPausedBackground',
  }),
  vaultClm: css.raw({
    backgroundColor: 'background.vaults.clm',
  }),
  vaultRetired: css.raw({
    backgroundColor: 'background.vaults.inactive',
  }),
};
