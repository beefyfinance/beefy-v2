import { getAddress } from 'viem';
import { beGemsFactoryAbi } from '../../../../config/abi/BeGemsFactoryAbi.ts';
import { BIG_ZERO, toWeiBigInt } from '../../../../helpers/big-number.ts';
import { getWalletConnectionApi } from '../../apis/instances.ts';
import { rpcClientManager } from '../../apis/rpc-contract/rpc-manager.ts';
import { fetchWalletContract } from '../../apis/rpc-contract/viem-contract.ts';
import {
  selectBeGemsFactoryAddress,
  selectBeGemsTokenSeasonData,
} from '../../selectors/campaigns/begems.ts';
import { selectChainById } from '../../selectors/chains.ts';
import { selectChainNativeToken, selectTokenByAddress } from '../../selectors/tokens.ts';
import { selectWalletAddress } from '../../selectors/wallet.ts';
import { getGasPriceOptions } from '../../utils/gas-utils.ts';
import { bindTransactionEvents, captureWalletErrors, txStart, txWallet } from './common.ts';

export function redeemGems(season: number, amount: BigNumber) {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const chainId = 'sonic' as const;
    const maybeAddress = selectWalletAddress(state);
    if (!maybeAddress) {
      throw new Error('No wallet address found.');
    }
    const address = getAddress(maybeAddress);

    const data = selectBeGemsTokenSeasonData(state, season);
    if (!data.token || !data.priceForFullShare) {
      throw new Error('Season not redeemable.');
    }

    const factoryAddress = selectBeGemsFactoryAddress(state);
    const chain = selectChainById(state, chainId);
    const native = selectChainNativeToken(state, chainId);
    const walletApi = await getWalletConnectionApi();
    const publicClient = rpcClientManager.getBatchClient(chainId);
    const walletClient = await walletApi.getConnectedViemClient();
    const factory = fetchWalletContract(factoryAddress, beGemsFactoryAbi, walletClient);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = factory.write.redeem([BigInt(season), toWeiBigInt(amount, 18), address], {
      account: address,
      ...gasPrices,
      chain: publicClient.chain,
    });

    bindTransactionEvents(
      dispatch,
      transaction,
      publicClient,
      { amount: BIG_ZERO, token: native }, // TODO fix so these are not required
      {
        walletAddress: address,
        chainId: chainId,
        spenderAddress: factoryAddress, // TODO fix so these are not required
        tokens: [selectTokenByAddress(state, chainId, data.token)],
      }
    );
  });
}
