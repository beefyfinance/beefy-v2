import React, { memo, useCallback, useState } from 'react';
import type { Theme } from '@material-ui/core';
import { Collapse, makeStyles, useMediaQuery } from '@material-ui/core';
import { styles } from './styles';
import type { VaultEntity } from '../../../../../data/entities/vault';
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
import { TabletStats } from '../TabletStats';
import { MobileCollapseContent } from '../MobileCollapseContent/MobileCollapseContent';

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

  const mobileView = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  return (
    <div>
      <div
        onClick={handleOpen}
        className={clsx({
          [classes.vault]: true,
          [classes.vaultEarnings]: isGov,
          [classes.vaultPaused]: isPaused,
          [classes.vaultRetired]: isRetired,
          lastBorderRadius: true,
        })}
      >
        <div className={classes.vaultInner}>
          <VaultIdentity isLink={true} networkClassName={classes.network} vaultId={vaultId} />
          <VaultDashboardStats vaultId={vaultId} />
        </div>
      </div>
      <Collapse in={open} timeout="auto">
        {mobileView ? (
          <MobileCollapseContent vaultId={vaultId} />
        ) : (
          <div className={classes.collapseInner}>
            <TabletStats vaultId={vaultId} />
            <VaultTransactions vaultId={vaultId} />
          </div>
        )}
      </Collapse>
    </div>
  );
});
