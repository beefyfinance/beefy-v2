import { createAsyncThunk } from '@reduxjs/toolkit';
import type { FullFilledFetchBalanceFromUnderlyingProtocol, Migrator } from './migration-types';
import type { VaultEntity } from '../../entities/vault';
import BigNumber from 'bignumber.js';
import type { BeefyState } from '../../../../redux-types';
import { selectVaultById } from '../../selectors/vaults';
import { selectChainById } from '../../selectors/chains';
import { selectWalletAddress } from '../../selectors/wallet';
import { getWeb3Instance } from '../instances';
import { selectTokenByAddress } from '../../selectors/tokens';
import { selectStakedLpAddressByVaultId } from '../../selectors/migration';
import { ConicLpTokenStakerAbi } from '../../../../config/abi';

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

  return { vaultId, walletAddress, balance: fixedBalance, migrationId: 'ethereum-conic' };
});

export const migrator: Migrator = { update: fetchConicStakedBalance };
