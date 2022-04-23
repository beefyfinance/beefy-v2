import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { VaultsHeader } from './components/VaultsHeader';
import { VaultsList } from './components/VaultsList';

const useStyles = makeStyles(styles);

export const Vaults = memo(function Vaults() {
  const classes = useStyles();

  return (
    <div className={classes.vaults}>
      <VaultsHeader />
      <VaultsList />
    </div>
  );
});
