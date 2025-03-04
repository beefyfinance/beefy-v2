import { css } from '@repo/styles/css';

export const styles = {
  vaultRow: css.raw({
    borderBottom: 'solid 2px {colors.background.content.dark}',
    '&:last-child': {
      borderBottom: '0',
      borderBottomLeftRadius: '8px',
      borderBottomRightRadius: '8px',
      backgroundClip: 'padding-box',
      overflow: 'hidden',
    },
  }),
  vault: css.raw({
    display: 'grid',
    position: 'relative',
    color: 'extracted676',
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
    backgroundColor: 'extracted1758',
  }),
  vaultClm: css.raw({
    backgroundColor: 'background.vaults.clm',
  }),
  vaultClmPool: css.raw({
    backgroundColor: 'background.vaults.clm.pool',
  }),
  vaultCowcentratedVault: css.raw({
    backgroundColor: 'background.vaults.clm.vault',
  }),
  vaultRetired: css.raw({
    backgroundColor: 'background.vaults.inactive',
  }),
};
