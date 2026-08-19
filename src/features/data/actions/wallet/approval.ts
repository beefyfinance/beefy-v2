import type { TokenErc20 } from '../../entities/token.ts';
import BigNumber from 'bignumber.js';
import { bindTransactionEvents, captureWalletErrors, txStart, txWallet } from './common.ts';
import { selectWalletAddress } from '../../selectors/wallet.ts';
import { getWalletConnectionApi } from '../../apis/instances.ts';
import { rpcClientManager } from '../../apis/rpc-contract/rpc-manager.ts';
import { fetchWalletContract } from '../../apis/rpc-contract/viem-contract.ts';
import { ERC20Abi } from '../../../../config/abi/ERC20Abi.ts';
import { selectChainNativeToken } from '../../selectors/tokens.ts';
import { bigNumberToBigInt, fromWei, toWei } from '../../../../helpers/big-number.ts';
import { selectChainById } from '../../selectors/chains.ts';
import { getGasPriceOptions } from '../../utils/gas-utils.ts';
import type { Address } from 'viem';
import { uniqBy } from 'lodash-es';

export const MIN_APPROVAL_AMOUNT = new BigNumber('8000000000000000000000000000'); // wei

export const approve = (token: TokenErc20, spenderAddress: string, amount: BigNumber) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const walletApi = await getWalletConnectionApi();
    const publicClient = rpcClientManager.getBatchClient(token.chainId);
    const walletClient = await walletApi.getConnectedViemClient();
    const viemContract = fetchWalletContract(token.address, ERC20Abi, walletClient);
    const native = selectChainNativeToken(state, token.chainId);

    const amountWei = toWei(amount, token.decimals);
    const approvalAmountWei = amountWei.gt(MIN_APPROVAL_AMOUNT) ? amountWei : MIN_APPROVAL_AMOUNT;
    const chain = selectChainById(state, token.chainId);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = viemContract.write.approve(
      [spenderAddress as Address, bigNumberToBigInt(approvalAmountWei)],
      {
        account: address as Address,
        ...gasPrices,
        chain: publicClient.chain,
      }
    );

    bindTransactionEvents(
      dispatch,
      transaction,
      publicClient,
      { spender: spenderAddress, amount: fromWei(approvalAmountWei, token.decimals), token: token },
      {
        walletAddress: address,
        chainId: token.chainId,
        spenderAddress,
        tokens: uniqBy([token, native], 'id'),
      }
    );
  });
};
