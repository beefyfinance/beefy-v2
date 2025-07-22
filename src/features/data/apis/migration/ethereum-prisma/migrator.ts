import type { Abi, Address } from 'viem';
import BigNumber from 'bignumber.js';
import type { Hash } from 'viem';
import { ERC20Abi } from '../../../../../config/abi/ERC20Abi.ts';
import { bigNumberToBigInt, toWei } from '../../../../../helpers/big-number.ts';
import type { VaultEntity } from '../../../entities/vault.ts';
import { selectTokenByAddress } from '../../../selectors/tokens.ts';
import { selectVaultStrategyAddress } from '../../../selectors/vaults.ts';
import { selectWalletAddress } from '../../../selectors/wallet.ts';
import type { BeefyState } from '../../../store/types.ts';
import { getWalletConnectionApi } from '../../instances.ts';
import { fetchContract, fetchWalletContract } from '../../rpc-contract/viem-contract.ts';
import type { Migrator, MigratorUnstakeProps } from '../migration-types.ts';
import { buildExecute, buildFetchBalance } from '../utils.ts';

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

async function unstakeCall(
  vault: VaultEntity,
  amount: BigNumber,
  state: BeefyState
): Promise<(args: MigratorUnstakeProps) => Promise<Hash>> {
  const wallet = selectWalletAddress(state);
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const amountInWei = toWei(amount, depositToken.decimals);
  let stakingAddress = await getStakingAddress(vault, state);
  const pools = prismaPools.find(s => s.includes(stakingAddress)) || [];
  if (pools.length > 1) {
    for (const address of pools) {
      const contract = fetchContract(address, ERC20Abi, vault.chainId);
      const bal = await contract.read.balanceOf([wallet as Address]);
      // const bal = await staking.methods.balanceOf(wallet).call();
      if (amountInWei.eq(new BigNumber(bal.toString(10)))) {
        stakingAddress = address;
        break;
      }
    }
  }
  const walletClient = await (await getWalletConnectionApi()).getConnectedViemClient();
  const contract = fetchWalletContract(stakingAddress, StakingAbi, walletClient);
  return (args: MigratorUnstakeProps) =>
    contract.write.withdraw([wallet as Address, bigNumberToBigInt(amountInWei)], args);
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

const StakingAbi = [
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
] as const satisfies Abi;

export const migrator: Migrator = {
  update: buildFetchBalance(id, getBalance),
  execute: buildExecute(id, unstakeCall),
};
