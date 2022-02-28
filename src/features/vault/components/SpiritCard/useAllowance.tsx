import { useState, useEffect } from 'react';
import { ZERO_ADDRESS } from './utils';
import { getERC20Contract } from '../../../../helpers/getERC20Contract';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { BIG_ZERO } from '../../../../helpers/format';
import { selectIsWalletConnected, selectWalletAddress } from '../../../data/selectors/wallet';
import { BeefyState } from '../../../../redux-types';
import { getWalletConnectApiInstance } from '../../../data/apis/instances';

export function useAllowance(tokenAddress, decimals, vaultAddress, network) {
  const [allowance, setAllowance] = useState(BIG_ZERO);

  const account = useSelector((state: BeefyState) =>
    selectIsWalletConnected(state) ? selectWalletAddress(state) : null
  );
  const isWalletCoInitiated = useSelector(
    (state: BeefyState) => state.ui.dataLoader.instances.wallet
  );

  useEffect(() => {
    let isCancelled = false;

    function getAllowance() {
      return new Promise<BigNumber>(async resolve => {
        if (!account || !tokenAddress || !isWalletCoInitiated) {
          resolve(BIG_ZERO);
          return;
        }

        const walletApi = await getWalletConnectApiInstance();
        const web3 = await walletApi.getConnectedWeb3Instance();

        try {
          if (tokenAddress === ZERO_ADDRESS) {
            web3.eth
              // @ts-ignore idk if this even works
              .allowance(account, vaultAddress)
              .then(value => {
                resolve(new BigNumber(value));
              })
              .catch(error => {
                console.log(error);
                resolve(BIG_ZERO);
              });
          } else {
            const contract = getERC20Contract(tokenAddress, web3);
            contract?.methods
              .allowance(account, vaultAddress)
              .call()
              .then(value => {
                resolve(new BigNumber(value));
              })
              .catch(error => {
                console.log(error);
                resolve(BIG_ZERO);
              });
          }
        } catch (error) {
          resolve(BIG_ZERO);
        }
      });
    }

    async function run() {
      const bn = await getAllowance();
      if (!isCancelled) {
        setAllowance(bn);
      }
    }

    run();

    return () => {
      isCancelled = true;
    };
  }, [tokenAddress, decimals, account, vaultAddress, isWalletCoInitiated]);

  return [allowance];
}
