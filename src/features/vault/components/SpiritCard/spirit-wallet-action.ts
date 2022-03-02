import BigNumber from 'bignumber.js';
import vaultAbi from '../../../../config/abi/vault.json';

import { WALLET_ACTION_RESET } from '../../../data/actions/wallet-actions';
import { getWalletConnectApiInstance } from '../../../data/apis/instances';
import {
  createWalletActionErrorAction,
  createWalletActionPendingAction,
  createWalletActionSuccessAction,
} from '../../../data/reducers/wallet/wallet-action';
import { selectWalletAddress } from '../../../data/selectors/wallet';
import { BinSpiritToken } from './SpiritToken';

export const spiritDeposit = (network, contractAddr, amount, max) => {
  return async (dispatch, getState) => {
    dispatch({ type: WALLET_ACTION_RESET });
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const walletApi = await getWalletConnectApiInstance();
    const web3 = await walletApi.getConnectedWeb3Instance();
    const contract = new web3.eth.Contract(vaultAbi as any, contractAddr);

    const transaction = (() => {
      if (max) {
        return contract.methods.depositAll().send({ from: address });
      } else {
        return contract.methods.deposit(amount).send({ from: address });
      }
    })();

    const additionalData = {
      amount: new BigNumber(amount).shiftedBy(-BinSpiritToken.decimals),
      token: BinSpiritToken,
    };
    transaction
      .on('transactionHash', function (hash) {
        dispatch(createWalletActionPendingAction(hash, additionalData));
      })
      .on('receipt', function (receipt) {
        dispatch(createWalletActionSuccessAction(receipt, additionalData));
      })
      .on('error', function (error) {
        dispatch(createWalletActionErrorAction(error, additionalData));
      })
      .catch(error => {
        dispatch(createWalletActionErrorAction({ message: String(error) }, additionalData));
      });
  };
};
