import type { Migrator } from '../migration-types';
import type { VaultEntity } from '../../../entities/vault';
import { type BigNumber } from 'bignumber.js';
import type { BeefyState } from '../../../../../redux-types';
import { selectTokenByAddress } from '../../../selectors/tokens';
import { ERC20Abi } from '../../../../../config/abi/ERC20Abi';
import { toWei } from '../../../../../helpers/big-number';
import type { AbiItem } from 'web3-utils';
import type Web3 from 'web3';
import { buildExecute, buildFetchBalance } from '../utils';
import { ZERO_ADDRESS } from '../../../../../helpers/addresses';
import type { ChainEntity } from '../../../entities/chain';
import { fetchContract } from '../../rpc-contract/viem-contract';
import type { Abi, Address } from 'abitype';

const id = 'l2-curve';

const crvFactory = (chainId: ChainEntity['id']) =>
  chainId === 'fraxtal'
    ? '0xeF672bD94913CB6f1d2812a6e18c1fFdEd8eFf5c'
    : '0xabC000d88f23Bb45525E447528DBF656A9D55bf5';

const override = {
  'spell-mim-crv': '0x6d2070b13929Df15B13D96cFC509C574168988Cd',
};

async function getStakingAddress(vault: VaultEntity, _: BeefyState): Promise<string> {
  if (vault.id in override) return override[vault.id];
  const factory = fetchContract(crvFactory(vault.chainId) as Address, CurveAbi, vault.chainId);
  return factory.read.get_gauge_from_lp_token([vault.depositTokenAddress as Address]);
}

async function getBalance(
  vault: VaultEntity,
  walletAddress: string,
  state: BeefyState
): Promise<string> {
  const stakingAddress = await getStakingAddress(vault, state);
  if (stakingAddress == ZERO_ADDRESS) return '0';
  const stakingContract = fetchContract(stakingAddress, ERC20Abi, vault.chainId);
  const walletBalance = await stakingContract.read.balanceOf([walletAddress as Address]);
  return walletBalance.toString(10);
}

async function unstakeCall(vault: VaultEntity, web3: Web3, amount: BigNumber, state: BeefyState) {
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const amountInWei = toWei(amount, depositToken.decimals);
  const stakingAddress = await getStakingAddress(vault, state);
  const staking = new web3.eth.Contract(CurveAbi as unknown as AbiItem[], stakingAddress);
  return staking.methods.withdraw(amountInWei.toString(10));
}

const CurveAbi = [
  {
    inputs: [{ name: 'lp', type: 'address' }],
    name: 'get_gauge_from_lp_token',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'uint256' }],
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
