import { memo } from 'react';
import { Vault } from './Vault';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import { VaultEntity } from '../../../../../data/entities/vault';

const useStyles = makeStyles(styles);

interface TableVaultsProps {
  vaults: VaultEntity[];
}

export const TableVaults = memo<TableVaultsProps>(function ({ vaults }) {
  const classes = useStyles();
  return (
    <div className={classes.vaultsContainer}>
      {vaults.map(vault => (
        <Vault key={vault.id} vaultId={vault.id} />
      ))}
    </div>
  );
});
