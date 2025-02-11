import type { Migrator } from '../migration-types';
import type { VaultEntity } from '../../../entities/vault';
import { type BigNumber } from 'bignumber.js';
import type { BeefyState } from '../../../../../redux-types';
import { ERC20Abi } from '../../../../../config/abi/ERC20Abi';
import type { AbiItem } from 'web3-utils';
import type Web3 from 'web3';
import { buildExecute, buildFetchBalance } from '../utils';
import { ZERO_ADDRESS } from '../../../../../helpers/addresses';
import { toWei } from '../../../../../helpers/big-number';
import { selectTokenByAddress } from '../../../selectors/tokens';
import { selectVaultStrategyAddress } from '../../../selectors/vaults';
import { fetchContract } from '../../rpc-contract/viem-contract';
import type { Abi, Address } from 'abitype';

const id = 'sonic-swapx';

function getStakingAddress(vault: VaultEntity, state: BeefyState) {
  const strategyAddress = selectVaultStrategyAddress(state, vault.id);
  const strategy = fetchContract(strategyAddress, abi, vault.chainId);
  return strategy.read.gauge();
}

async function getBalance(
  vault: VaultEntity,
  walletAddress: string,
  state: BeefyState
): Promise<string> {
  const stakingAddress = await getStakingAddress(vault, state);
  if (stakingAddress == ZERO_ADDRESS) return '0n';
  const staking = fetchContract(stakingAddress, ERC20Abi, vault.chainId);
  const balance = await staking.read.balanceOf([walletAddress as Address]);
  return balance.toString(10);
}

async function unstakeCall(vault: VaultEntity, web3: Web3, amount: BigNumber, state: BeefyState) {
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const amountInWei = toWei(amount, depositToken.decimals);
  const stakingAddress = await getStakingAddress(vault, state);
  return new web3.eth.Contract(abi as unknown as AbiItem[], stakingAddress).methods.withdraw(
    amountInWei.toString(10)
  );
}

const abi = [
  {
    inputs: [],
    name: 'gauge',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const satisfies Abi;

export const migrator: Migrator = {
  update: buildFetchBalance(id, getBalance),
  execute: buildExecute(id, unstakeCall),
};
