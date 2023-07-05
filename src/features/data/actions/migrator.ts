import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import type { MigratorConfig } from '../apis/config-types';
import type { ChainEntity } from '../entities/chain';
import { getConfigApi, getWeb3Instance } from '../apis/instances';
import BigNumber from 'bignumber.js';
import type { VaultEntity } from '../entities/vault';
import { selectChainById } from '../selectors/chains';
import { ConicLpTokenStakerAbi } from '../../../config/abi';
import { selectWalletAddress } from '../selectors/wallet';
import { selectVaultById } from '../selectors/vaults';
import { selectTokenByAddress } from '../selectors/tokens';
import { selectStakedLpAddressByVaultId } from '../selectors/migration';

export interface FulfilledAllMigratorsPayload {
  byChainId: {
    [chainId: ChainEntity['id']]: MigratorConfig[];
  };
  state: BeefyState;
}

export const fetchAllMigrators = createAsyncThunk<
  FulfilledAllMigratorsPayload,
  void,
  { state: BeefyState }
>('migration/fetchAllMigrators', async (_, { getState }) => {
  const api = getConfigApi();
  const migrators = await api.fetchAllMigrators();
  return { byChainId: migrators, state: getState() };
});

interface FullFilledFetchBalanceFromUnderlyingProtocol {
  balance: BigNumber;
  vaultId: VaultEntity['id'];
  walletAddress: string;
}

const CONIC_LP_TOKEN_STAKER = '0xeC037423A61B634BFc490dcc215236349999ca3d';

export const fetchConicStakedBalance = createAsyncThunk<
  FullFilledFetchBalanceFromUnderlyingProtocol,
  { vaultId: VaultEntity['id'] },
  { state: BeefyState }
>('migration/fetchConicStakedBalance', async ({ vaultId }, { getState }) => {
  const state = getState();
  const vault = selectVaultById(state, vaultId);
  const ethChain = selectChainById(state, 'ethereum');
  const walletAddress = selectWalletAddress(state);
  const web3 = await getWeb3Instance(ethChain);
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const conicPoolAddress = selectStakedLpAddressByVaultId(state, vaultId);
  const lpTokenStaker = new web3.eth.Contract(ConicLpTokenStakerAbi, CONIC_LP_TOKEN_STAKER);
  const balance = await lpTokenStaker.methods
    .getUserBalanceForPool(conicPoolAddress, walletAddress)
    .call();

  const fixedBalance = new BigNumber(balance).shiftedBy(-depositToken.decimals);

  return { vaultId, walletAddress, balance: fixedBalance };
});
