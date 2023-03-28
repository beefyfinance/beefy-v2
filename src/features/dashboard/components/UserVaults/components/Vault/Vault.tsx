import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { VaultEntity } from '../../../../../data/entities/vault';
import { VaultIdentity } from '../../../../../../components/VaultIdentity';
import { VaultDashboardStats } from '../../../../../../components/VaultStats/VaultDashboardStats';

const useStyles = makeStyles(styles);

export type VaultProps = {
  vaultId: VaultEntity['id'];
};
export const Vault = memo<VaultProps>(function Vault({ vaultId }) {
  const classes = useStyles();

  return (
    <div className={classes.vault}>
      <div className={classes.vaultInner}>
        <VaultIdentity isLink={true} networkClassName={classes.network} vaultId={vaultId} />
        <VaultDashboardStats vaultId={vaultId} />
      </div>
    </div>
  );
});
