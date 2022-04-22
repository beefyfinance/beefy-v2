import { useState, useEffect } from 'react';
import { getContract } from '../../../../../../helpers/getContract';
import BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../../../../helpers/format';
import { getWeb3Instance } from '../../../../../data/apis/instances';
import MinterABI from '../../../../../../config/abi/minter.json';

export function useReserves(tokenAddress, chain, beQiBalance) {
  const [reserves, setReserves] = useState(BIG_ZERO);

  useEffect(() => {
    let isCancelled = false;

    function getReserves() {
      return new Promise<BigNumber>(async resolve => {
        if (!tokenAddress) {
          resolve(BIG_ZERO);
          return;
        }
        const web3 = await getWeb3Instance(chain);
        const contract = getContract(tokenAddress, web3, MinterABI);
        try {
          contract?.methods
            .withdrawableBalance()
            .call()
            .then(value => {
              resolve(new BigNumber(value));
            })
            .catch(error => {
              resolve(BIG_ZERO);
            });
        } catch (error) {
          resolve(BIG_ZERO);
        }
      });
    }

    async function run() {
      const bn = await getReserves();
      if (!isCancelled) {
        setReserves(bn);
      }
    }

    run();

    return () => {
      isCancelled = true;
    };
  }, [tokenAddress, chain, beQiBalance]);

  return reserves;
}
