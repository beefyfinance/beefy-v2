import React, { memo, useCallback, useState } from 'react';
import { Collapse, makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { VaultEntity } from '../../../../../data/entities/vault';
import { VaultIdentity } from '../../../../../../components/VaultIdentity';
import { VaultDashboardStats } from '../../../../../../components/VaultStats/VaultDashboardStats';
import { VaultTransactions } from '../VaultTransactions';
import { useAppSelector } from '../../../../../../store';
import {
  selectIsVaultGov,
  selectIsVaultPaused,
  selectIsVaultRetired,
} from '../../../../../data/selectors/vaults';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type VaultProps = {
  vaultId: VaultEntity['id'];
};
export const Vault = memo<VaultProps>(function Vault({ vaultId }) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const isRetired = useAppSelector(state => selectIsVaultRetired(state, vaultId));
  const isPaused = useAppSelector(state => selectIsVaultPaused(state, vaultId));
  const isGov = useAppSelector(state => selectIsVaultGov(state, vaultId));

  const handleOpen = useCallback(() => {
    setOpen(!open);
  }, [open]);

  return (
    <div>
      <div
        onClick={handleOpen}
        className={clsx({
          [classes.vault]: true,
          [classes.vaultRetired]: isRetired,
          [classes.vaultPaused]: isPaused,
          [classes.vaultEarnings]: isGov,
          lastBorderRadius: true,
        })}
      >
        <div className={classes.vaultInner}>
          <VaultIdentity isLink={true} networkClassName={classes.network} vaultId={vaultId} />
          <VaultDashboardStats vaultId={vaultId} />
        </div>
      </div>
      <Collapse in={open} timeout="auto">
        <div className={classes.collapseInner}>
          <VaultTransactions vaultId={vaultId} />
        </div>
      </Collapse>
    </div>
  );
});
