import { useState, useEffect } from 'react';
import { ZERO_ADDRESS } from './utils';
import { getERC20Contract } from '../../../../helpers/getERC20Contract';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { BIG_ZERO } from '../../../../helpers/format';

export function useAllowance(tokenAddress, decimals, vaultAddress, network) {
  const [allowance, setAllowance] = useState(BIG_ZERO);

  const { wallet } = useSelector((state: any) => ({
    wallet: state.walletReducer,
  }));

  const web3 = wallet.rpc[network];
  const account = wallet.address;

  useEffect(() => {
    let isCancelled = false;

    function getAllowance() {
      return new Promise<BigNumber>(resolve => {
        if (!web3 || !tokenAddress) {
          resolve(BIG_ZERO);
          return;
        }

        try {
          if (tokenAddress === ZERO_ADDRESS) {
            web3.eth
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
  }, [tokenAddress, web3, decimals, account, vaultAddress]);

  return [allowance];
}
