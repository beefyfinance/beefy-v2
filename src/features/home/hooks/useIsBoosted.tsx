/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import filter from 'lodash/filter';
import { useDispatch } from 'react-redux';
import { useVaults } from '../hooks/useFilteredVaults';

export const useIsBoosted = item => {
  const [state, setState] = React.useState({ isBoosted: false, data: null, vaultBoosts: [] });
  const data = useVaults();
  const boostVaults = data[6];

  React.useEffect(() => {
    var ts = Date.now() / 1000;

    const boostedVault = filter(boostVaults, function (vault) {
      return (
        vault.poolId === item.id && vault.status === 'active' && parseInt(vault.periodFinish) > ts
      );
    });

    const vaultBoosts = filter(boostVaults, vault => {
      return vault.poolId === item.id;
    });

    if (boostedVault.length !== 0) {
      setState({ isBoosted: true, data: boostedVault[0], vaultBoosts: vaultBoosts });
      setInterval(() => {
        setState({ isBoosted: true, data: boostedVault[0], vaultBoosts: vaultBoosts });
      }, 60000);
    } else {
      setState({ isBoosted: false, data: null, vaultBoosts: vaultBoosts });
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
};
