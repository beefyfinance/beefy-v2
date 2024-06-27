import React, { memo, useCallback, useState } from 'react';
import type { Theme } from '@material-ui/core';
import { makeStyles, useMediaQuery } from '@material-ui/core';
import { styles } from './styles';
import type { VaultEntity } from '../../../../../data/entities/vault';
import { VaultIdentity } from '../../../../../../components/VaultIdentity';
import { VaultDashboardStats } from '../../../../../../components/VaultStats/VaultDashboardStats';
import { useAppSelector } from '../../../../../../store';
import {
  selectIsVaultCowcentratedLike,
  selectIsVaultGov,
  selectIsVaultPaused,
  selectIsVaultRetired,
  selectVaultUnderlyingCowcentratedVaultIdOrUndefined,
} from '../../../../../data/selectors/vaults';
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
  const isRetired = useAppSelector(state => selectIsVaultRetired(state, vaultId));
  const isPaused = useAppSelector(state => selectIsVaultPaused(state, vaultId));
  const isGov = useAppSelector(state => selectIsVaultGov(state, vaultId));
  const isCowcentratedLike = useAppSelector(state => selectIsVaultCowcentratedLike(state, vaultId));
  const handleOpen = useCallback(() => {
    setOpen(o => !o);
  }, [setOpen]);
  const mobileView = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'), { noSsr: true });
  const CollapseComponent = mobileView ? MobileCollapseContent : DesktopCollapseContent;
  const underlyingClmId = useAppSelector(state =>
    selectVaultUnderlyingCowcentratedVaultIdOrUndefined(state, vaultId)
  );

  return (
    <div className={classes.vaultRow}>
      <div
        onClick={handleOpen}
        className={clsx({
          [classes.vault]: true,
          [classes.vaultEarnings]: isGov && !isCowcentratedLike,
          [classes.vaultClm]: isCowcentratedLike === 'cowcentrated',
          [classes.vaultClmPool]: isCowcentratedLike === 'gov',
          [classes.vaultPaused]: isPaused,
          [classes.vaultRetired]: isRetired,
        })}
      >
        <div className={classes.vaultInner}>
          <VaultIdentity isLink={true} vaultId={underlyingClmId ?? vaultId} />
          <VaultDashboardStats vaultId={vaultId} address={address} />
        </div>
      </div>
      {open ? <CollapseComponent address={address} vaultId={underlyingClmId ?? vaultId} /> : null}
    </div>
  );
});
