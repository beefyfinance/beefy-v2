import type {
  ClmInvestorTimelineResponse,
  ClmPendingRewardsResponse,
  ClmPeriod,
  ClmPriceHistoryEntry,
  ClmVaultHarvestsResponse,
  ClmVaultsHarvestsResponse,
  IClmApi,
} from './clm-api-types.ts';
import type { VaultEntity } from '../../entities/vault.ts';
import type { ChainEntity } from '../../entities/chain.ts';
import { type Abi } from 'viem';
import BigNumber from 'bignumber.js';
import { BeefyCowcentratedLiquidityVaultAbi } from '../../../../config/abi/BeefyCowcentratedLiquidityVaultAbi.ts';
import { getUnixTime, roundToNearestMinutes } from 'date-fns';
import { getJson } from '../../../../helpers/http/http.ts';
import { isFetchNotFoundError } from '../../../../helpers/http/errors.ts';
import { fetchContract } from '../rpc-contract/viem-contract.ts';

const ClmStrategyAbi = [
  {
    inputs: [],
    name: 'fees0',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'fees1',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claimEarnings',
    outputs: [
      { internalType: 'uint256', name: 'fee0', type: 'uint256' },
      { internalType: 'uint256', name: 'fee1', type: 'uint256' },
      { internalType: 'uint256', name: 'feeAlt0', type: 'uint256' },
      { internalType: 'uint256', name: 'feeAlt1', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

export class ClmApi implements IClmApi {
  public clmBase: string;

  constructor() {
    this.clmBase = import.meta.env.VITE_CLM_URL || 'https://clm-api.beefy.finance';
  }

  public async getInvestorTimeline(address: string): Promise<ClmInvestorTimelineResponse> {
    try {
      return getJson<ClmInvestorTimelineResponse>({
        url: `${this.clmBase}/api/v1/investor/${address}/timeline`,
      });
    } catch (err) {
      if (isFetchNotFoundError(err)) {
        return [];
      }
      throw err;
    }
  }

  public async getPriceHistoryForVaultSince<T extends ClmPriceHistoryEntry>(
    chainId: ChainEntity['id'],
    vaultAddress: VaultEntity['contractAddress'],
    since: Date,
    period: ClmPeriod
  ): Promise<T[]> {
    const nearestMinute = roundToNearestMinutes(since);

    return await getJson<T[]>({
      url: `${this.clmBase}/api/v1/vault/${chainId}/${vaultAddress}/prices/${period}/${getUnixTime(
        nearestMinute
      )}`,
    });
  }

  public async getHarvestsForVault(
    chainId: ChainEntity['id'],
    vaultAddress: VaultEntity['contractAddress']
  ): Promise<ClmVaultHarvestsResponse> {
    return await getJson<ClmVaultHarvestsResponse>({
      url: `${this.clmBase}/api/v1/vault/${chainId}/${vaultAddress.toLocaleLowerCase()}/harvests`,
    });
  }

  public async getHarvestsForVaultsSince(
    chainId: ChainEntity['id'],
    vaultAddresses: VaultEntity['contractAddress'][],
    since: Date
  ): Promise<ClmVaultsHarvestsResponse> {
    const nearestMinute = roundToNearestMinutes(since);
    const orderedAddresses = vaultAddresses.map(addr => addr.toLowerCase()).sort();

    return await getJson<ClmVaultsHarvestsResponse>({
      url: `${this.clmBase}/api/v1/vaults/${chainId}/harvests/${getUnixTime(nearestMinute)}`,
      params: orderedAddresses.map(addr => ['vaults', addr]),
    });
  }

  public async getClmPendingRewards(
    chain: ChainEntity,
    stratAddress: string,
    vaultAddress: VaultEntity['contractAddress']
  ): Promise<ClmPendingRewardsResponse> {
    const stratContract = fetchContract(stratAddress, ClmStrategyAbi, chain.id);
    const vaultContract = fetchContract(vaultAddress, BeefyCowcentratedLiquidityVaultAbi, chain.id);

    const [
      fees0Result,
      fees1Result,
      totalSupplyResult,
      [pendingFee0, pendingFee1, pendingFee0Alt, pendingFee1Alt],
    ] = await Promise.all([
      stratContract.read.fees0(),
      stratContract.read.fees1(),
      vaultContract.read.totalSupply(),
      stratContract.read.claimEarnings(),
    ]);

    const fees0 = new BigNumber((fees0Result + pendingFee0 + pendingFee0Alt).toString(10));
    const fees1 = new BigNumber((fees1Result + pendingFee1 + pendingFee1Alt).toString(10));
    const totalSupply = new BigNumber(totalSupplyResult.toString(10));

    //returns all numbers unshifted
    return { fees0, fees1, totalSupply };
  }
}
