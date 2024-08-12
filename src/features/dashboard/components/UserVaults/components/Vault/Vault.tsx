import { memo, useCallback, useState } from 'react';
import type { Theme } from '@material-ui/core';
import { makeStyles, useMediaQuery } from '@material-ui/core';
import { styles } from './styles';
import {
  isCowcentratedGovVault,
  isCowcentratedLikeVault,
  isCowcentratedStandardVault,
  isCowcentratedVault,
  isGovVault,
  isVaultPaused,
  isVaultRetired,
  type VaultEntity,
} from '../../../../../data/entities/vault';
import { VaultIdentity } from '../../../../../../components/VaultIdentity';
import { VaultDashboardStats } from '../../../../../../components/VaultStats/VaultDashboardStats';
import { useAppSelector } from '../../../../../../store';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import clsx from 'clsx';
import { MobileCollapseContent } from '../CollapseContent/MobileCollapseContent';
import { DesktopCollapseContent } from '../CollapseContent/DesktopCollapseContent';

const useStyles = makeStyles(styles);

export type VaultProps = {
  vaultId: VaultEntity['id'];
  address: string;
};
export const Vault = memo<VaultProps>(function Vault({ vaultId, address }) {
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
  const mobileView = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'), { noSsr: true });
  const CollapseComponent = mobileView ? MobileCollapseContent : DesktopCollapseContent;

  return (
    <div className={classes.vaultRow}>
      <div
        onClick={handleOpen}
        className={clsx({
          [classes.vault]: true,
          [classes.vaultEarnings]: isGov,
          [classes.vaultClm]: isCowcentrated,
          [classes.vaultClmPool]: isCowcentratedPool,
          [classes.vaultCowcentratedVault]: isCowcentratedStandard,
          [classes.vaultPaused]: isPaused,
          [classes.vaultRetired]: isRetired,
        })}
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
