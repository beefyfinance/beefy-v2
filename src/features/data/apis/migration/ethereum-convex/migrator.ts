import { createAsyncThunk } from '@reduxjs/toolkit';
import type {
  CommonMigrationUpdateFulfilledPayload,
  Migrator,
  MigratorUpdateProps,
} from '../migration-types';
import type { VaultEntity } from '../../../entities/vault';
import BigNumber from 'bignumber.js';
import type { BeefyState } from '../../../../../redux-types';
import { selectVaultById, selectVaultStrategyAddress } from '../../../selectors/vaults';
import { selectChainById } from '../../../selectors/chains';
import { getWalletConnectionApiInstance, getWeb3Instance } from '../../instances';
import { selectTokenByAddress } from '../../../selectors/tokens';
import { ERC20Abi } from '../../../../../config/abi';
import { toWei } from '../../../../../helpers/big-number';
import type { AbiItem } from 'web3-utils';
import type Web3 from 'web3';
import { buildExecute } from '../utils';

const id = 'ethereum-convex';

function getStakingAddress(vault: VaultEntity, web3: Web3, state: BeefyState): Promise<string> {
  const strategyAddress = selectVaultStrategyAddress(state, vault.id);
  const strategy = new web3.eth.Contract(ConvexStrategyAbi, strategyAddress);
  if (vault.assetIds.length === 1) {
    if (vault.assetIds[0] == 'cvxCRV') {
      return strategy.methods.stakedCvxCrv().call();
    } else {
      return strategy.methods.staking().call();
    }
  } else {
    return strategy.methods.rewardPool().call();
  }
}

const fetchStakedBalance = createAsyncThunk<
  CommonMigrationUpdateFulfilledPayload,
  MigratorUpdateProps,
  { state: BeefyState }
>(`migration/${id}/update`, async ({ vaultId, walletAddress }, { getState }) => {
  const state = getState();
  const vault = selectVaultById(state, vaultId);
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const chain = selectChainById(state, vault.chainId);
  const web3 = await getWeb3Instance(chain);

  const stakingAddress = await getStakingAddress(vault, web3, state);
  const convexStaking = new web3.eth.Contract(ERC20Abi, stakingAddress);
  const balance = await convexStaking.methods.balanceOf(walletAddress).call();

  const fixedBalance = new BigNumber(balance).shiftedBy(-depositToken.decimals);
  return { vaultId, walletAddress, balance: fixedBalance, migrationId: id };
});

async function unstakeCall(
  vault: VaultEntity,
  amount: BigNumber,
  state: BeefyState
  // eslint-disable-next-line
): Promise<any> {
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const walletApi = await getWalletConnectionApiInstance();
  const web3 = await walletApi.getConnectedWeb3Instance();

  const stakingAddress = await getStakingAddress(vault, web3, state);
  const convexStaking = new web3.eth.Contract(ConvexAbi, stakingAddress);
  const amountInWei = toWei(amount, depositToken.decimals);

  if (vault.assetIds.length === 1) {
    return convexStaking.methods.withdraw(amountInWei.toString(10));
  } else {
    return convexStaking.methods.withdrawAllAndUnwrap(true);
  }
}

const ConvexStrategyAbi: AbiItem[] = [
  {
    inputs: [],
    name: 'stakedCvxCrv',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'staking',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rewardPool',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
];

const ConvexAbi: AbiItem[] = [
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bool', name: 'claim', type: 'bool' }],
    name: 'withdrawAllAndUnwrap',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export const migrator: Migrator = {
  update: fetchStakedBalance,
  execute: buildExecute(id, unstakeCall),
};
