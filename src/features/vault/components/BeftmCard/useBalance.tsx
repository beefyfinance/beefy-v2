import { useState, useEffect } from 'react';
import { ZERO_ADDRESS, web3BNToFloatString } from './utils';
import { getERC20Contract } from '../../../../helpers/getERC20Contract';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { BIG_ZERO, byDecimals } from '../../../../helpers/format';
import { selectIsWalletConnected, selectWalletAddress } from '../../../data/selectors/wallet';
import { BeefyState } from '../../../../redux-types';
import { getWalletConnectApiInstance } from '../../../data/apis/instances';

export function useBalance(tokenAddress, decimals, network) {
  const [balance, setBalance] = useState(BIG_ZERO);
  const [balanceString, setBalanceString] = useState('0');
  const account = useSelector((state: BeefyState) =>
    selectIsWalletConnected(state) ? selectWalletAddress(state) : null
  );

  const isWalletCoInitiated = useSelector(
    (state: BeefyState) => state.ui.dataLoader.instances.wallet
  );

  useEffect(() => {
    let isCancelled = false;

    function getBalance() {
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
              .getBalance(account)
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
              .balanceOf(account)
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
      const bn = await getBalance();
      if (!isCancelled) {
        const pow = new BigNumber('10').pow(new BigNumber(decimals));
        setBalance(byDecimals(bn, decimals));
        setBalanceString(web3BNToFloatString(bn, pow, 2, BigNumber.ROUND_DOWN));
      }
    }

    run();

    return () => {
      isCancelled = true;
    };
  }, [tokenAddress, decimals, account, isWalletCoInitiated]);

  return [balance, balanceString];
}
