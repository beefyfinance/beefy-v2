import type { ChainEntity } from '../../entities/chain.ts';
import { bindTransactionEvents, captureWalletErrors, txStart, txWallet } from './common.ts';
import { selectWalletAddress } from '../../selectors/wallet.ts';
import {
  fetchUserMerklRewardsAction,
  MERKL_SUPPORTED_CHAINS,
} from '../user-rewards/merkl-user-rewards.ts';
import { selectChainById } from '../../selectors/chains.ts';
import { selectChainNativeToken, selectTokenByAddressOrUndefined } from '../../selectors/tokens.ts';
import { BIG_ZERO, toWeiString } from '../../../../helpers/big-number.ts';
import { getWalletConnectionApi } from '../../apis/instances.ts';
import { rpcClientManager } from '../../apis/rpc-contract/rpc-manager.ts';
import { fetchWalletContract } from '../../apis/rpc-contract/viem-contract.ts';
import { AngleMerklDistributorAbi } from '../../../../config/abi/AngleMerklDistributor.ts';
import { getGasPriceOptions } from '../../utils/gas-utils.ts';
import type { Address } from 'viem';
import { isDefined } from '../../utils/array-utils.ts';
import type { VaultEntity } from '../../entities/vault.ts';
import { fetchUserStellaSwapRewardsAction } from '../user-rewards/stellaswap-user-rewards.ts';
import { first, groupBy } from 'lodash-es';
import { stellaswapRewarderAbi } from '../../../../config/abi/StellaSwapRewarder.ts';

export const claimMerkl = (chainId: ChainEntity['id']) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const distributorAddress = MERKL_SUPPORTED_CHAINS.get(chainId);
    if (!distributorAddress) {
      throw new Error(`No Merkl contract found for chain ${chainId}`);
    }

    const chain = selectChainById(state, chainId);
    const native = selectChainNativeToken(state, chainId);
    const { byChainId } = await dispatch(
      fetchUserMerklRewardsAction({ walletAddress: address, reloadChainId: chainId })
    ).unwrap();
    const unclaimedRewards = (byChainId[chain.id] || []).map(({ token, accumulated, proof }) => ({
      token: token.address,
      amount: toWeiString(accumulated, token.decimals), // proof requires 'accumulated' amount
      proof: proof,
    }));
    if (!unclaimedRewards.length) {
      throw new Error('No unclaimed merkl rewards found');
    }

    const users = new Array<string>(unclaimedRewards.length).fill(address);
    const tokens = unclaimedRewards.map(reward => reward.token);
    const amounts = unclaimedRewards.map(reward => reward.amount);
    const proofs = unclaimedRewards.map(reward => reward.proof);

    const walletApi = await getWalletConnectionApi();
    const publicClient = rpcClientManager.getBatchClient(chainId);
    const walletClient = await walletApi.getConnectedViemClient();
    const contract = fetchWalletContract(
      distributorAddress,
      AngleMerklDistributorAbi,
      walletClient
    );
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = contract.write.claim(
      [
        users as Address[],
        tokens,
        amounts.map(amount => BigInt(amount)),
        proofs.map(proof => proof as Address[]),
      ],
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
      { amount: BIG_ZERO, token: native }, // TODO fix so these are not required
      {
        walletAddress: address,
        chainId: chainId,
        spenderAddress: distributorAddress, // TODO fix so these are not required
        tokens: tokens
          .map(token => selectTokenByAddressOrUndefined(state, chainId, token))
          .filter(isDefined),
        rewards: true,
      }
    );
  });
};
export const claimStellaSwap = (chainId: ChainEntity['id'], vaultId: VaultEntity['id']) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }
    if (chainId !== 'moonbeam') {
      throw new Error(`Can't claimStellaSwap on ${chainId}`);
    }

    const chain = selectChainById(state, chainId);
    const native = selectChainNativeToken(state, chainId);
    const { byVaultId } = await dispatch(
      fetchUserStellaSwapRewardsAction({ walletAddress: address, force: true })
    ).unwrap();
    const vaultRewards = byVaultId[vaultId];
    if (!vaultRewards) {
      throw new Error(`No unclaimed stellaswap rewards found for ${vaultId}`);
    }
    const unclaimedRewards = vaultRewards
      .filter(({ unclaimed }) => unclaimed.gt(BIG_ZERO))
      .map(({ token, accumulated, proofs, position, isNative, claimContractAddress }) => ({
        claimContractAddress,
        claim: {
          user: address,
          position,
          token: token.address,
          amount: toWeiString(accumulated, token.decimals), // TODO proof requires 'accumulated' amount?
          isNative,
          proof: proofs,
        },
      }));
    if (!unclaimedRewards.length) {
      throw new Error(`No unclaimed stellaswap rewards found for ${vaultId}`);
    }

    const claimsByContract = Object.values(
      groupBy(unclaimedRewards, r => r.claimContractAddress)
    ).map(rewards => ({
      to: rewards[0].claimContractAddress,
      claims: rewards.map(({ claim }) => claim),
    }));

    const walletApi = await getWalletConnectionApi();
    const publicClient = rpcClientManager.getBatchClient(chainId);
    const walletClient = await walletApi.getConnectedViemClient();
    const gasPrices = await getGasPriceOptions(chain);

    const makeTransaction = () => {
      if (claimsByContract.length === 1) {
        const { to, claims } = claimsByContract[0];
        console.log(claims);
        const contract = fetchWalletContract(to, stellaswapRewarderAbi, walletClient);
        return contract.write.claim(
          [
            claims.map(claim => ({
              user: claim.user as Address,
              token: claim.token,
              amount: BigInt(claim.amount),
              position: BigInt(claim.position),
              isNative: claim.isNative,
              proof: claim.proof as Address[],
            })),
          ],
          {
            account: address as Address,
            ...gasPrices,
            chain: publicClient.chain,
          }
        );
      } else {
        throw new Error('TODO: implement multi-rewarder contract claim');
      }
    };

    txWallet(dispatch);
    const transaction = makeTransaction();

    const spenderAddress = first(unclaimedRewards)!.claimContractAddress;
    const tokens = unclaimedRewards.map(r => r.claim.token);
    bindTransactionEvents(
      dispatch,
      transaction,
      publicClient,
      { amount: BIG_ZERO, token: native }, // TODO fix so these are not required
      {
        walletAddress: address,
        chainId: chainId,
        spenderAddress, // TODO fix so these are not required
        tokens: tokens
          .map(token => selectTokenByAddressOrUndefined(state, chainId, token))
          .filter(isDefined),
        rewards: true,
      }
    );
  });
};
