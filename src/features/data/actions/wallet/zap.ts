import type { Address } from 'viem';
import { uniqBy } from 'lodash-es';
import { BeefyZapRouterAbi } from '../../../../config/abi/BeefyZapRouterAbi.ts';
import { ZERO_ADDRESS } from '../../../../helpers/addresses.ts';
import { BIG_ZERO } from '../../../../helpers/big-number.ts';
import { getWalletConnectionApi } from '../../apis/instances.ts';
import { rpcClientManager } from '../../apis/rpc-contract/rpc-manager.ts';
import { fetchWalletContract } from '../../apis/rpc-contract/viem-contract.ts';
import type { UserlessZapRequest, ZapOrder, ZapStep } from '../../apis/transact/zap/types.ts';
import type { TokenEntity } from '../../entities/token.ts';
import { isGovVault, type VaultEntity } from '../../entities/vault.ts';
import { selectChainById } from '../../selectors/chains.ts';
import { selectTokenByAddress, selectTokenByAddressOrUndefined } from '../../selectors/tokens.ts';
import { selectVaultById } from '../../selectors/vaults.ts';
import { selectWalletAddress } from '../../selectors/wallet.ts';
import { selectZapByChainId } from '../../selectors/zap.ts';
import type { BeefyState } from '../../store/types.ts';
import { getGasPriceOptions } from '../../utils/gas-utils.ts';
import {
  bindTransactionEvents,
  captureWalletErrors,
  selectVaultTokensToRefresh,
  txStart,
  txWallet,
} from './common.ts';

export const zapExecuteOrder = (
  vaultId: VaultEntity['id'],
  params: UserlessZapRequest,
  expectedTokens: TokenEntity[]
) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      throw new Error(`No wallet connected`);
    }

    const vault = selectVaultById(state, vaultId);
    const chain = selectChainById(state, vault.chainId);
    const zap = selectZapByChainId(state, vault.chainId);
    if (!zap) {
      throw new Error(`No zap found for chain ${chain.id}`);
    }
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

    const order: ZapOrder = {
      ...params.order,
      inputs: params.order.inputs.filter(i => BIG_ZERO.lt(i.amount)), // remove <= zero amounts
      user: address,
      recipient: address,
    };
    if (!order.inputs.length) {
      throw new Error('No inputs provided');
    }

    // @dev key order must match actual function / `components` in ABI
    const castedOrder = {
      inputs: params.order.inputs
        .filter(i => BIG_ZERO.lt(i.amount))
        .map(i => ({
          token: i.token as Address,
          amount: BigInt(i.amount),
        })), // remove <= zero amounts
      outputs: params.order.outputs.map(o => ({
        token: o.token as Address,
        minOutputAmount: BigInt(o.minOutputAmount),
      })),
      relay: {
        target: params.order.relay.target as Address,
        value: BigInt(params.order.relay.value),
        data: params.order.relay.data as `0x${string}`,
      },
      user: address as Address,
      recipient: address as Address,
    };

    const steps: ZapStep[] = params.steps;
    if (!steps.length) {
      throw new Error('No steps provided');
    }

    // @dev key order must match actual function / `components` in ABI
    const castedSteps = params.steps.map(step => ({
      target: step.target as Address,
      value: BigInt(step.value),
      data: step.data as `0x${string}`,
      tokens: step.tokens.map(t => ({
        token: t.token as Address,
        index: t.index,
      })),
    }));

    const walletApi = await getWalletConnectionApi();
    const publicClient = rpcClientManager.getBatchClient(vault.chainId);
    const walletClient = await walletApi.getConnectedViemClient();
    const gasPrices = await getGasPriceOptions(chain);
    const nativeInput = castedOrder.inputs.find(input => input.token === ZERO_ADDRESS);

    const contract = fetchWalletContract(zap.router, BeefyZapRouterAbi, walletClient);
    const options = {
      ...gasPrices,
      account: castedOrder.user,
      chain: publicClient.chain,
      value: nativeInput ? nativeInput.amount : undefined,
    };

    txWallet(dispatch);
    console.debug('executeOrder', { order: castedOrder, steps: castedSteps, options });
    const transaction = contract.write.executeOrder([castedOrder, castedSteps], options);

    bindTransactionEvents(
      dispatch,
      transaction,
      publicClient,
      {
        type: 'zap',
        amount: BIG_ZERO,
        token: depositToken,
        expectedTokens,
        vaultId: vault.id,
      },
      {
        walletAddress: address,
        chainId: vault.chainId,
        spenderAddress: zap.manager,
        tokens: selectZapTokensToRefresh(state, vault, order),
        clearInput: true,
        ...(isGovVault(vault) ? { govVaultId: vault.id } : {}),
      }
    );
  });
};

function selectZapTokensToRefresh(
  state: BeefyState,
  vault: VaultEntity,
  order: ZapOrder
): TokenEntity[] {
  const tokens: TokenEntity[] = selectVaultTokensToRefresh(state, vault);

  for (const { token: tokenAddress } of order.inputs) {
    const token = selectTokenByAddressOrUndefined(state, vault.chainId, tokenAddress);
    if (token) {
      tokens.push(token);
    }
  }

  for (const { token: tokenAddress } of order.outputs) {
    const token = selectTokenByAddressOrUndefined(state, vault.chainId, tokenAddress);
    if (token) {
      tokens.push(token);
    }
  }

  return uniqBy(tokens, 'id');
}
