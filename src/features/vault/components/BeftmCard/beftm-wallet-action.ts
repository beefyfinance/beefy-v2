import BigNumber from 'bignumber.js';
import vaultAbi from '../../../../config/abi/BeFtmAbi.json';

import { WALLET_ACTION_RESET } from '../../../data/actions/wallet-actions';
import { getWalletConnectApiInstance } from '../../../data/apis/instances';
import {
  createWalletActionErrorAction,
  createWalletActionPendingAction,
  createWalletActionSuccessAction,
} from '../../../data/reducers/wallet/wallet-action';
import { selectWalletAddress } from '../../../data/selectors/wallet';
import { Ftmtoken, BeFTMToken } from './BeFtmToken';

export const beFtmDeposit = (contractAddr: string, amount: BigNumber, max: boolean) => {
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

    const rawAmount = amount.shiftedBy(Ftmtoken.decimals).decimalPlaces(0);

    const transaction = (() => {
      return contract.methods
        .depositNative()
        .send({ from: address, value: rawAmount.toString(10) });
    })();

    const additionalData = {
      amount: amount,
      token: BeFTMToken,
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
