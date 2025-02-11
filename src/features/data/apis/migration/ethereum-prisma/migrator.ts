import type { Migrator } from '../migration-types';
import type { VaultEntity } from '../../../entities/vault';
import { BigNumber } from 'bignumber.js';
import type { BeefyState } from '../../../../../redux-types';
import { selectVaultStrategyAddress } from '../../../selectors/vaults';
import { selectTokenByAddress } from '../../../selectors/tokens';
import { ERC20Abi } from '../../../../../config/abi/ERC20Abi';
import { toWei } from '../../../../../helpers/big-number';
import type { AbiItem } from 'web3-utils';
import type Web3 from 'web3';
import { buildExecute, buildFetchBalance } from '../utils';
import { selectWalletAddress } from '../../../selectors/wallet';
import { fetchContract } from '../../rpc-contract/viem-contract';
import type { Abi, Address } from 'abitype';

const id = 'ethereum-prisma';

// Prisma has 2 staking pools (curve and convex) that use same curve-LP
// we try to migrate from both by checking if strategy.rewardPool is any of them
// (could probably just do lp to pools mapping here and don't call strat.rewardPool)
const prismaPools = [
  ['0xB5376AB455194328Fe41450a587f11bcDA2363fa', '0x685E852E4c18c2c554a1D25c1197684fd9593145'],
  ['0x71aD6c1d92546065B13bf701a7524c69B409E25C', '0xf6aA46869220Ae703924d5331D88A21DceF3b19d'],
  ['0x0Ae09f649e9dA1b6aEA0c10527aC4e8a88a37480', '0x5F8D4319C27a940B5783b4495cCa6626E880532E'],
  ['0x49cd193227a896F867AFDB6A5edFb53A3Ee7fb49', '0xa68C880009B8e78CC42B215702573A7552ef2C68'],
  ['0xa9aA35B5481A7B7936d1680911D478F7A639fE48', '0x48c5e00c63e327F73F789E300472F1744AAa7e34'],
  ['0xDA70A660d635e496B336059b38EBb5f849A75CAf', '0xFEaB09F0DDE4D03C1345519F281025f9B8A11CDF'],
];

function getStakingAddress(vault: VaultEntity, state: BeefyState): Promise<string> {
  const strategyAddress = selectVaultStrategyAddress(state, vault.id);
  const strategyContract = fetchContract(strategyAddress, StrategyAbi, vault.chainId);
  return strategyContract.read.rewardPool();
}

async function getBalance(
  vault: VaultEntity,
  walletAddress: string,
  state: BeefyState
): Promise<string> {
  const stakingAddress = await getStakingAddress(vault, state);
  const pools = prismaPools.find(s => s.includes(stakingAddress)) || [];
  if (pools.length > 0) {
    const promises = pools.map(address => {
      const stakingContract = fetchContract(address, ERC20Abi, vault.chainId);
      return stakingContract.read.balanceOf([walletAddress as Address]);
    });
    const res = await Promise.all(promises);
    const balances = res
      .map(b => new BigNumber(b.toString(10)))
      .sort((b1, b2) => (b1.gte(b2) ? -1 : 1));
    return balances[0].toString(10);
  } else {
    const stakingContract = fetchContract(stakingAddress, ERC20Abi, vault.chainId);
    const walletBalance = await stakingContract.read.balanceOf([walletAddress as Address]);
    return walletBalance.toString(10);
  }
}

async function unstakeCall(vault: VaultEntity, web3: Web3, amount: BigNumber, state: BeefyState) {
  const wallet = selectWalletAddress(state);
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const amountInWei = toWei(amount, depositToken.decimals);
  let stakingAddress = await getStakingAddress(vault, state);
  const pools = prismaPools.find(s => s.includes(stakingAddress)) || [];
  if (pools.length > 1) {
    for (const address of pools) {
      const staking = new web3.eth.Contract(ERC20Abi as unknown as AbiItem[], address);
      const bal = await staking.methods.balanceOf(wallet).call();
      if (amountInWei.eq(new BigNumber(bal))) {
        stakingAddress = address;
        break;
      }
    }
  }
  const staking = new web3.eth.Contract(StakingAbi, stakingAddress);
  return staking.methods.withdraw(wallet, amountInWei.toString(10));
}

const StrategyAbi = [
  {
    inputs: [],
    name: 'rewardPool',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

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
