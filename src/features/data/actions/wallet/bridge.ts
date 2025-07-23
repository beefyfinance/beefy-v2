import type { IBridgeQuote } from '../../apis/bridge/providers/provider-types.ts';
import type { BeefyAnyBridgeConfig } from '../../apis/config-types.ts';
import { bindTransactionEvents, captureWalletErrors, txStart, txWallet } from './common.ts';
import { selectWalletAddress } from '../../selectors/wallet.ts';
import { selectChainById } from '../../selectors/chains.ts';
import { selectChainNativeToken } from '../../selectors/tokens.ts';
import { toWeiString } from '../../../../helpers/big-number.ts';
import { isTokenEqual } from '../../entities/token.ts';
import { getWalletConnectionApi } from '../../apis/instances.ts';
import { rpcClientManager } from '../../apis/rpc-contract/rpc-manager.ts';
import { fetchWalletContract } from '../../apis/rpc-contract/viem-contract.ts';
import { BeefyCommonBridgeAbi } from '../../../../config/abi/BeefyCommonBridgeAbi.ts';
import { getGasPriceOptions } from '../../utils/gas-utils.ts';
import type { Address } from 'viem';
import { uniqBy } from 'lodash-es';

export const bridgeViaCommonInterface = (quote: IBridgeQuote<BeefyAnyBridgeConfig>) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const fromAddress = selectWalletAddress(state);
    if (!fromAddress) {
      return;
    }

    const { input, output, fee, config } = quote;
    const fromChainConfig = config.chains[input.token.chainId];
    if (!fromChainConfig) {
      throw new Error(`No config found for chain ${input.token.chainId}`);
    }
    const viaBeefyBridgeAddress = fromChainConfig.bridge;
    const fromChainId = input.token.chainId;
    const toChainId = output.token.chainId;
    const fromChain = selectChainById(state, fromChainId);
    const toChain = selectChainById(state, toChainId);
    const gasToken = selectChainNativeToken(state, fromChainId);
    const inputWei = toWeiString(input.amount, input.token.decimals);
    const feeWei = toWeiString(fee.amount, fee.token.decimals);
    const receiverAddress = quote.receiver || fromAddress;

    if (!isTokenEqual(gasToken, fee.token)) {
      console.debug(gasToken, fee.token);
      throw new Error(`Only native fee token is supported`);
    }

    const walletApi = await getWalletConnectionApi();
    const publicClient = rpcClientManager.getBatchClient(fromChainId);
    const walletClient = await walletApi.getConnectedViemClient();
    const contract = fetchWalletContract(viaBeefyBridgeAddress, BeefyCommonBridgeAbi, walletClient);
    const gasPrices = await getGasPriceOptions(fromChain);

    txWallet(dispatch);
    const transaction = contract.write.bridge(
      [BigInt(toChain.networkChainId), BigInt(inputWei), receiverAddress as Address],
      {
        ...gasPrices,
        account: fromAddress as Address,
        value: BigInt(feeWei),
        chain: publicClient.chain,
      }
    );

    bindTransactionEvents(
      dispatch,
      transaction,
      publicClient,
      {
        type: 'bridge',
        amount: input.amount,
        token: input.token,
        quote: quote,
      },
      {
        walletAddress: fromAddress,
        chainId: fromChainId,
        spenderAddress: viaBeefyBridgeAddress,
        tokens: uniqBy([gasToken, input.token], 'id'),
      }
    );
  });
};
