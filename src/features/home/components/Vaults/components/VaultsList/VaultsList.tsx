import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { selectFilteredVaults } from '../../../../../data/selectors/filtered-vaults';
import { NoResults } from '../NoResults';
import { VirtualVaultsList } from '../VirtualVaultsList';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const VaultsList = memo(function VaultsList() {
  const vaultIds = useSelector(selectFilteredVaults);
  const classes = useStyles();

  return (
    <div className={classes.vaultsList}>
      {vaultIds.length === 0 ? <NoResults /> : null}
      <VirtualVaultsList vaultIds={vaultIds} />
    </div>
  );
});
