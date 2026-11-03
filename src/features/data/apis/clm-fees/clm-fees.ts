import { chunk } from 'lodash-es';
import {
  type Abi,
  type Address,
  type ContractFunctionParameters,
  formatUnits,
  parseAbi,
  zeroAddress,
} from 'viem';
import type { ChainEntity } from '../../entities/chain.ts';
import type { VaultCowcentrated } from '../../entities/vault.ts';
import { toCallAddress } from '../../utils/address-utils.ts';
import { isDefined } from '../../utils/array-utils.ts';
import { rpcClientManager } from '../rpc-contract/rpc-manager.ts';
import type { ClmFee, ClmFeeRange } from './clm-fees-types.ts';

const CALLS_PER_MULTICALL = 100;
/** pool fee units: 1e6 = 100% */
const PIPS = 1_000_000;
const ALGEBRA_MAX_FEE = 65_535;

const vaultAbi = parseAbi(['function swapFee() view returns (uint256)']);
const poolAbi = parseAbi([
  'function factory() view returns (address)',
  'function tickSpacing() view returns (int24)',
  'function dataStorageOperator() view returns (address)',
  'function plugin() view returns (address)',
]);
const factoryAbi = parseAbi([
  'function getPoolSwapHook(address pool) view returns (address)',
  'function swapFeeModule() view returns (address)',
  'function tickSpacingToFee(int24 tickSpacing) view returns (uint24)',
]);
const feeModuleAbi = parseAbi([
  'function dynamicFeeConfig(address pool) view returns (uint24 baseFee, uint24 feeCap, uint64 scalingFactor, bool initialFeeEnabled, uint24 initialFee)',
  'function ZERO_FEE_INDICATOR() view returns (uint256)',
  'function defaultScalingFactor() view returns (uint256)',
  'function defaultFeeCap() view returns (uint256)',
]);
// older modules return only the first 3 fields, which fails to decode with the abi above
const legacyFeeModuleAbi = parseAbi([
  'function dynamicFeeConfig(address pool) view returns (uint24 baseFee, uint24 feeCap, uint64 scalingFactor)',
]);
const algebraV1Abi = parseAbi([
  'function feeConfig() view returns (uint16 alpha1, uint16 alpha2, uint32 beta1, uint32 beta2, uint16 gamma1, uint16 gamma2, uint32 volumeBeta, uint16 volumeGamma, uint16 baseFee)',
  'function feeConfigZto() view returns (uint16 alpha1, uint16 alpha2, uint32 beta1, uint32 beta2, uint16 gamma1, uint16 gamma2, uint32 volumeBeta, uint16 volumeGamma, uint16 baseFee)',
  'function feeConfigOtz() view returns (uint16 alpha1, uint16 alpha2, uint32 beta1, uint32 beta2, uint16 gamma1, uint16 gamma2, uint32 volumeBeta, uint16 volumeGamma, uint16 baseFee)',
]);
const algebraIntegralAbi = parseAbi([
  'function feeConfig() view returns (uint16 alpha1, uint16 alpha2, uint32 beta1, uint32 beta2, uint16 gamma1, uint16 gamma2, uint16 baseFee)',
]);

type Call = ContractFunctionParameters<Abi, 'view'>;
type AlgebraFeeConfig = readonly [number, number, ...unknown[]];
type DynamicFeeConfig =
  | readonly [baseFee: number, feeCap: number, scalingFactor: bigint]
  | readonly [
      baseFee: number,
      feeCap: number,
      scalingFactor: bigint,
      initialFeeEnabled: boolean,
      initialFee: number,
    ];

export class ClmFeesApi {
  constructor(protected chain: ChainEntity) {}

  /** Current fee of each vault, undefined where the read failed */
  public async fetchSwapFees(vaults: VaultCowcentrated[], onError?: () => void): Promise<ClmFee[]> {
    const fees = await this.multicall(
      vaults.map(vault => ({
        address: toCallAddress(vault.contractAddress),
        abi: vaultAbi,
        functionName: 'swapFee',
      })),
      onError
    );
    return vaults.map((vault, i) => ({ id: vault.id, swapFee: toSwapFee(fees[i]) }));
  }

  /**
   * Current fee plus the min/max the pool's fee can move between.
   * Each AMM keeps its fee bounds somewhere else, so the pool is probed for each known source;
   * the range is undefined when none is found (e.g. uniswap v3 style fixed fees).
   * Not complete if any rpc request failed, in which case no ranges are returned.
   */
  public async fetchSwapFeesWithRange(
    vaults: VaultCowcentrated[]
  ): Promise<{ fees: ClmFee[]; complete: boolean }> {
    const pools = vaults.map(vault => toCallAddress(vault.poolAddress));
    let complete = true;
    const onError = () => {
      complete = false;
    };
    const multicall = (calls: Call[]) => this.multicall(calls, onError);
    const multicallSparse = (calls: (Call | undefined)[]) => this.multicallSparse(calls, onError);

    const [fees, factories, tickSpacings, dataStorageOperators, plugins] = await Promise.all([
      this.fetchSwapFees(vaults, onError),
      multicall(pools.map(pool => ({ address: pool, abi: poolAbi, functionName: 'factory' }))),
      multicall(pools.map(pool => ({ address: pool, abi: poolAbi, functionName: 'tickSpacing' }))),
      multicall(
        pools.map(pool => ({ address: pool, abi: poolAbi, functionName: 'dataStorageOperator' }))
      ),
      multicall(pools.map(pool => ({ address: pool, abi: poolAbi, functionName: 'plugin' }))),
    ]);

    const factoryCalls = (functionName: string, args: (i: number) => unknown[]) =>
      multicallSparse(
        pools.map((_, i) =>
          isContract(factories[i]) ?
            { address: factories[i], abi: factoryAbi, functionName, args: args(i) }
          : undefined
        )
      );
    const configCalls = (sources: unknown[], abi: Abi, functionName: string) =>
      multicallSparse(
        pools.map((_, i) =>
          isContract(sources[i]) ? { address: sources[i], abi, functionName } : undefined
        )
      );

    const [hooks, modules, tierFees, algebraV1, algebraZto, algebraOtz, algebraIntegral] =
      await Promise.all([
        factoryCalls('getPoolSwapHook', i => [pools[i]]),
        factoryCalls('swapFeeModule', () => []),
        factoryCalls('tickSpacingToFee', i => [tickSpacings[i]]),
        configCalls(dataStorageOperators, algebraV1Abi, 'feeConfig'),
        configCalls(dataStorageOperators, algebraV1Abi, 'feeConfigZto'),
        configCalls(dataStorageOperators, algebraV1Abi, 'feeConfigOtz'),
        configCalls(plugins, algebraIntegralAbi, 'feeConfig'),
      ]);

    // aero pools use a swap hook, older slipstream forks a factory-wide fee module
    const feeSources = pools.map((_, i) =>
      isContract(hooks[i]) ? hooks[i]
      : isContract(modules[i]) ? modules[i]
      : undefined
    );
    const sourceCalls = (
      functionName: string,
      args: (i: number) => unknown[],
      abi: Abi = feeModuleAbi
    ) =>
      multicallSparse(
        pools.map((_, i) =>
          feeSources[i] ? { address: feeSources[i], abi, functionName, args: args(i) } : undefined
        )
      );
    const [
      dynamicFeeConfigs,
      legacyDynamicFeeConfigs,
      zeroFeeIndicators,
      defaultScalingFactors,
      defaultFeeCaps,
    ] = await Promise.all([
      sourceCalls('dynamicFeeConfig', i => [pools[i]]),
      sourceCalls('dynamicFeeConfig', i => [pools[i]], legacyFeeModuleAbi),
      sourceCalls('ZERO_FEE_INDICATOR', () => []),
      sourceCalls('defaultScalingFactor', () => []),
      sourceCalls('defaultFeeCap', () => []),
    ]);

    if (!complete) {
      return { fees, complete };
    }

    const feesWithRange = fees.map((fee, i) => {
      const dynamicFeeConfig = (dynamicFeeConfigs[i] ?? legacyDynamicFeeConfigs[i]) as
        | DynamicFeeConfig
        | undefined;
      let range: ClmFeeRange | undefined;
      if (dynamicFeeConfig && typeof tierFees[i] === 'number') {
        range = getDynamicFeeModuleRange({
          isHook: isContract(hooks[i]),
          config: dynamicFeeConfig,
          zeroFeeIndicator: zeroFeeIndicators[i] as bigint | undefined,
          defaultScalingFactor: defaultScalingFactors[i] as bigint | undefined,
          defaultFeeCap: defaultFeeCaps[i] as bigint | undefined,
          tierFee: tierFees[i],
        });
      } else {
        const algebraConfigs = [
          algebraV1[i],
          algebraZto[i],
          algebraOtz[i],
          algebraIntegral[i],
        ].filter(isDefined) as AlgebraFeeConfig[];
        if (algebraConfigs.length) {
          range = getAlgebraFeeRange(algebraConfigs);
        }
      }
      return { ...fee, range };
    });
    return { fees: feesWithRange, complete };
  }

  /** Never rejects: a failed chunk yields undefined results */
  protected async multicall(calls: Call[], onError?: () => void): Promise<unknown[]> {
    const client = rpcClientManager.getSingleClient(this.chain.id);
    const results = await Promise.all(
      chunk(calls, CALLS_PER_MULTICALL).map(batch =>
        client
          .multicall({ contracts: batch, allowFailure: true, batchSize: 0 })
          .then(res => res.map(r => (r.status === 'success' ? r.result : undefined)))
          .catch(err => {
            console.error(`Failed to fetch CLM fees on ${this.chain.id}`, err);
            onError?.();
            return batch.map(() => undefined);
          })
      )
    );
    return results.flat();
  }

  /** Multicall that skips undefined calls, keeping results aligned with the input */
  protected async multicallSparse(
    calls: (Call | undefined)[],
    onError?: () => void
  ): Promise<unknown[]> {
    const indexes = calls.flatMap((call, i) => (call ? [i] : []));
    const results = await this.multicall(
      indexes.map(i => calls[i]!),
      onError
    );
    const aligned: unknown[] = calls.map(() => undefined);
    indexes.forEach((callIndex, i) => (aligned[callIndex] = results[i]));
    return aligned;
  }
}

function isContract(value: unknown): value is Address {
  return typeof value === 'string' && value !== zeroAddress;
}

/** vault.swapFee() is scaled so 1e18 = 100% */
function toSwapFee(raw: unknown): number | undefined {
  return typeof raw === 'bigint' ? Number(formatUnits(raw, 18)) : undefined;
}

function pipsRange(min: number, max: number): ClmFeeRange {
  return { min: min / PIPS, max: max / PIPS };
}

/**
 * Slipstream style fee: min(baseFee + volatility * scalingFactor, feeCap),
 * with an optional fixed fee for the first swap in each block.
 * See DynamicSwapFeeModule.getFee / DynamicSwapFeeHook._getFirstSwapFee.
 */
export function getDynamicFeeModuleRange({
  isHook,
  config,
  zeroFeeIndicator,
  defaultScalingFactor,
  defaultFeeCap,
  tierFee,
}: {
  isHook: boolean;
  config: DynamicFeeConfig;
  zeroFeeIndicator: bigint | undefined;
  defaultScalingFactor: bigint | undefined;
  defaultFeeCap: bigint | undefined;
  tierFee: number;
}): ClmFeeRange | undefined {
  const [configBaseFee, configFeeCap, configScalingFactor] = config;
  // on ZERO_FEE_INDICATOR the hook falls back to the tick spacing fee, the module charges nothing
  const zeroFee = isHook ? tierFee : 0;
  const isZeroFeeIndicator = (fee: number) =>
    zeroFeeIndicator !== undefined && BigInt(fee) === zeroFeeIndicator;
  if (isZeroFeeIndicator(configBaseFee)) {
    return pipsRange(zeroFee, zeroFee);
  }

  const baseFee = configBaseFee || tierFee;
  const initialFee =
    config.length === 5 && config[3] ?
      isZeroFeeIndicator(config[4]) ? zeroFee
      : config[4] || baseFee
    : undefined;
  let scalingFactor = configScalingFactor;
  let feeCap = configFeeCap;
  // a zero scaling factor falls back to the defaults for both scaling factor and cap
  if (scalingFactor === 0n) {
    if (defaultScalingFactor === undefined || defaultFeeCap === undefined) {
      return undefined;
    }
    scalingFactor = defaultScalingFactor;
    feeCap = Number(defaultFeeCap);
  }

  const min = Math.min(baseFee, feeCap);
  const max = scalingFactor === 0n ? min : feeCap;
  // the initial fee is not capped
  return initialFee === undefined ?
      pipsRange(min, max)
    : pipsRange(Math.min(min, initialFee), Math.max(max, initialFee));
}

/** Algebra adaptive fee: baseFee + two sigmoids, each between 0 and its alpha */
export function getAlgebraFeeRange(configs: AlgebraFeeConfig[]): ClmFeeRange {
  const baseFee = (config: AlgebraFeeConfig) => config[config.length - 1] as number;
  const min = Math.min(...configs.map(baseFee));
  const max = Math.max(
    ...configs.map(config => Math.min(baseFee(config) + config[0] + config[1], ALGEBRA_MAX_FEE))
  );
  return pipsRange(min, max);
}
