import { memo } from 'react';
import { Vault } from './Vault';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(styles);

interface TableVaultsProps {
  data: any;
}

export const TableVaults = memo<TableVaultsProps>(function ({ data }) {
  const classes = useStyles();
  return (
    <div className={classes.vaultsContainer}>
      {data.vaults.map(vault => (
        <Vault vaultId={vault.id} />
      ))}
    </div>
  );
});
