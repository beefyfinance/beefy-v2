import type { Migrator } from '../migration-types';
import type { VaultEntity } from '../../../entities/vault';
import type BigNumber from 'bignumber.js';
import type { BeefyState } from '../../../../../redux-types';
import { selectVaultStrategyAddress } from '../../../selectors/vaults';
import { selectTokenByAddress } from '../../../selectors/tokens';
import { ERC20Abi } from '../../../../../config/abi';
import { toWei } from '../../../../../helpers/big-number';
import type { AbiItem } from 'web3-utils';
import type Web3 from 'web3';
import { buildExecute, buildFetchBalance } from '../utils';
import { selectWalletAddress } from '../../../selectors/wallet';

const id = 'ethereum-prisma';

function getStakingAddress(vault: VaultEntity, web3: Web3, state: BeefyState): Promise<string> {
  const strategyAddress = selectVaultStrategyAddress(state, vault.id);
  const strategy = new web3.eth.Contract(StrategyAbi, strategyAddress);
  return strategy.methods.rewardPool().call();
}

async function getBalance(
  vault: VaultEntity,
  web3: Web3,
  walletAddress: string,
  state: BeefyState
): Promise<string> {
  const stakingAddress = await getStakingAddress(vault, web3, state);
  const staking = new web3.eth.Contract(ERC20Abi, stakingAddress);
  return staking.methods.balanceOf(walletAddress).call();
}

async function unstakeCall(vault: VaultEntity, web3: Web3, amount: BigNumber, state: BeefyState) {
  const wallet = selectWalletAddress(state);
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const amountInWei = toWei(amount, depositToken.decimals);
  const stakingAddress = await getStakingAddress(vault, web3, state);
  const staking = new web3.eth.Contract(StakingAbi, stakingAddress);
  return staking.methods.withdraw(wallet, amountInWei.toString(10));
}

const StrategyAbi: AbiItem[] = [
  {
    inputs: [],
    name: 'rewardPool',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
];

const StakingAbi: AbiItem[] = [
  {
    inputs: [
      { internalType: 'address', name: 'receiver', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'withdraw',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export const migrator: Migrator = {
  update: buildFetchBalance(id, getBalance),
  execute: buildExecute(id, unstakeCall),
};
