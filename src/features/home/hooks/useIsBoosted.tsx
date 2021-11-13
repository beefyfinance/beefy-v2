/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import lodash from 'lodash';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { useVaults } from '../hooks/useFilteredVaults';
import { reduxActions } from '../../redux/actions';

export const useIsBoosted = item => {
  const [state, setState] = React.useState({ isBoosted: false, data: null, vaultBoosts: [] });
  const dispatch = useDispatch();
  const data = useVaults();
  const boostVaults = data[6];

  React.useEffect(() => {
    var ts = Date.now() / 1000;

    const boostedVault = lodash.filter(boostVaults, function (vault) {
      return (
        vault.poolId === item.id && vault.status === 'active' && parseInt(vault.periodFinish) > ts
      );
    });

    const vaultBoosts = lodash.filter(boostVaults, (vault) => {
      return vault.poolId === item.id
    });

    if (boostedVault.length !== 0) {
      setState({ isBoosted: true, data: boostedVault[0], vaultBoosts: vaultBoosts });
      setInterval(() => {
        setState({ isBoosted: true, data: boostedVault[0], vaultBoosts:  vaultBoosts});
      }, 60000);
    } else {
      setState({ isBoosted: false, data: null, vaultBoosts: vaultBoosts });
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
};
