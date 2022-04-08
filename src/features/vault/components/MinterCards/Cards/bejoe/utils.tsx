import { useState, useEffect } from 'react';
import { getContract } from '../../../../../../helpers/getContract';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { BIG_ZERO } from '../../../../../../helpers/format';
import { selectIsWalletConnected, selectWalletAddress } from '../../../../../data/selectors/wallet';
import { BeefyState } from '../../../../../../redux-types';
import { getWalletConnectApiInstance } from '../../../../../data/apis/instances';
import MinterABI from '../../../../../../config/abi/minter.json';

export function useReserves(tokenAddress) {
  const [reserves, setReserves] = useState(BIG_ZERO);

  const account = useSelector((state: BeefyState) =>
    selectIsWalletConnected(state) ? selectWalletAddress(state) : null
  );
  const isWalletCoInitiated = useSelector(
    (state: BeefyState) => state.ui.dataLoader.instances.wallet
  );

  useEffect(() => {
    let isCancelled = false;

    function getReserves() {
      return new Promise<BigNumber>(async resolve => {
        if (!account || !tokenAddress || !isWalletCoInitiated) {
          resolve(BIG_ZERO);
          return;
        }
        const walletApi = await getWalletConnectApiInstance();
        const web3 = await walletApi.getConnectedWeb3Instance();
        const contract = getContract(tokenAddress, web3, MinterABI);
        try {
          contract?.methods
            .balanceOfWant()
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
  }, [tokenAddress, isWalletCoInitiated, account]);

  return reserves;
}
