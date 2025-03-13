import { memo, useCallback, useState } from 'react';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { styles } from './styles.ts';
import {
  isCowcentratedGovVault,
  isCowcentratedLikeVault,
  isCowcentratedStandardVault,
  isCowcentratedVault,
  isGovVault,
  isVaultPaused,
  isVaultRetired,
  type VaultEntity,
} from '../../../../../data/entities/vault.ts';
import { VaultIdentity } from '../../../../../../components/VaultIdentity/VaultIdentity.tsx';
import { VaultDashboardStats } from '../../../../../../components/VaultStats/VaultDashboardStats.tsx';
import { useAppSelector } from '../../../../../../store.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { css } from '@repo/styles/css';
import { MobileCollapseContent } from '../CollapseContent/MobileCollapseContent/MobileCollapseContent.tsx';
import { DesktopCollapseContent } from '../CollapseContent/DesktopCollapseContent/DesktopCollapseContent.tsx';
import { useBreakpoint } from '../../../../../../components/MediaQueries/useBreakpoint.ts';

const useStyles = legacyMakeStyles(styles);

export type VaultProps = {
  vaultId: VaultEntity['id'];
  address: string;
};
export const Vault = memo(function Vault({ vaultId, address }: VaultProps) {
  const classes = useStyles();
  const [open, setOpen] = useState<boolean>(false);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const isRetired = isVaultRetired(vault);
  const isPaused = isVaultPaused(vault);
  const isCowcentratedPool = isCowcentratedGovVault(vault); // cowcentrated pool
  const isCowcentratedStandard = isCowcentratedStandardVault(vault); // cowcentrated vault
  const isCowcentrated = isCowcentratedVault(vault); // naked clm
  const isGov = !isCowcentratedLikeVault(vault) && isGovVault(vault); // gov but not cowcentrated pool
  const handleOpen = useCallback(() => {
    setOpen(o => !o);
  }, [setOpen]);
  const mobileView = useBreakpoint({ to: 'sm' });
  const CollapseComponent = mobileView ? MobileCollapseContent : DesktopCollapseContent;

  return (
    <div className={classes.vaultRow}>
      <div
        onClick={handleOpen}
        className={css(
          styles.vault,
          isGov && styles.vaultEarnings,
          isCowcentrated && styles.vaultClm,
          isCowcentratedPool && styles.vaultClmPool,
          isCowcentratedStandard && styles.vaultCowcentratedVault,
          isPaused && styles.vaultPaused,
          isRetired && styles.vaultRetired
        )}
      >
        <div className={classes.vaultInner}>
          <VaultIdentity isLink={true} vaultId={vaultId} />
          <VaultDashboardStats vaultId={vaultId} address={address} />
        </div>
      </div>
      {open ? <CollapseComponent address={address} vaultId={vaultId} /> : null}
    </div>
  );
});
