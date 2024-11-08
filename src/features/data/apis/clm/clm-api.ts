import type {
  ClmInvestorTimelineResponse,
  ClmPendingRewardsResponse,
  ClmPeriod,
  ClmPriceHistoryEntry,
  ClmVaultHarvestsResponse,
  ClmVaultsHarvestsResponse,
  IClmApi,
} from './clm-api-types';
import type { VaultEntity } from '../../entities/vault';
import type { ChainEntity } from '../../entities/chain';
import type { Abi } from 'viem';
import { getWeb3Instance } from '../instances';
import { makeBatchRequest, viemToWeb3Abi, type Web3Call } from '../../../../helpers/web3';
import { BigNumber } from 'bignumber.js';
import { BeefyCowcentratedLiquidityVaultAbi } from '../../../../config/abi/BeefyCowcentratedLiquidityVaultAbi';
import { getUnixTime, roundToNearestMinutes } from 'date-fns';
import { getJson } from '../../../../helpers/http';
import { isFetchNotFoundError } from '../../../../helpers/http/errors';

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
    const web3 = await getWeb3Instance(chain);

    const strat = new web3.eth.Contract(viemToWeb3Abi(ClmStrategyAbi), stratAddress);
    const vault = new web3.eth.Contract(
      viemToWeb3Abi(BeefyCowcentratedLiquidityVaultAbi),
      vaultAddress
    );

    const calls: Web3Call[] = [
      {
        method: strat.methods.claimEarnings().call,
        params: { from: '0x0000000000000000000000000000000000000000' },
      },
      {
        method: strat.methods.fees0().call,
        params: { from: '0x0000000000000000000000000000000000000000' },
      },
      {
        method: strat.methods.fees1().call,
        params: { from: '0x0000000000000000000000000000000000000000' },
      },
      {
        method: vault.methods.totalSupply().call,
        params: { from: '0x0000000000000000000000000000000000000000' },
      },
    ];

    const results = await makeBatchRequest(web3, calls);

    const { fee0, fee1, feeAlt0, feeAlt1 } = results[0] as {
      fee0: string;
      fee1: string;
      feeAlt0: string;
      feeAlt1: string;
    };

    const fees0 = new BigNumber(results[1] as string)
      .plus(new BigNumber(fee0))
      .plus(new BigNumber(feeAlt0));
    const fees1 = new BigNumber(results[2] as string)
      .plus(new BigNumber(fee1))
      .plus(new BigNumber(feeAlt1));

    const totalSupply = new BigNumber(results[3] as string);

    //returns all numbers unshifted
    return { fees0, fees1, totalSupply };
  }
}
