import { css } from '@repo/styles/css';
import { memo, useCallback, useState } from 'react';
import { useBreakpoint } from '../../../../../../hooks/useBreakpoint.ts';
import { VaultIdentity } from '../../../../../../components/VaultIdentity/VaultIdentity.tsx';
import { VaultDashboardStats } from '../../../../../../components/VaultStats/VaultDashboardStats.tsx';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import {
  isCowcentratedLikeVault,
  isCowcentratedVault,
  isGovVault,
  isVaultPaused,
  isVaultRetired,
  type VaultEntity,
} from '../../../../../data/entities/vault.ts';
import { ClmGroupScopeContext } from '../../../../../vault/components/ClmMode/ClmModeContext.tsx';
import { selectDashboardRowSideIds } from '../../../../../data/selectors/balance.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { DesktopCollapseContent } from '../CollapseContent/DesktopCollapseContent/DesktopCollapseContent.tsx';
import { MobileCollapseContent } from '../CollapseContent/MobileCollapseContent/MobileCollapseContent.tsx';
import { styles } from './styles.ts';

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
  const isCowcentrated = isCowcentratedVault(vault);
  // a CLM row held on both sides charts them together; one side charts itself, as on prod
  const isClmGroup = useAppSelector(
    state => selectDashboardRowSideIds(state, vaultId, address).length > 1
  );
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
          isPaused && styles.vaultPaused,
          isRetired && styles.vaultRetired
        )}
      >
        <div className={classes.vaultInner}>
          <VaultIdentity isLink={true} vaultId={vaultId} />
          <VaultDashboardStats vaultId={vaultId} address={address} />
        </div>
      </div>
      {open ?
        <ClmGroupScopeContext.Provider value={isClmGroup}>
          <CollapseComponent address={address} vaultId={vaultId} />
        </ClmGroupScopeContext.Provider>
      : null}
    </div>
  );
});
