import { partition, uniq } from 'lodash-es';
import type { Namespace, TFunction } from 'react-i18next';
import { allFulfilled, isFulfilledResult } from '../../../../helpers/promises.ts';
import type { ChainEntity } from '../../entities/chain.ts';
import { isCowcentratedLikeVault, type VaultEntity } from '../../entities/vault.ts';
import type { Step } from '../../reducers/wallet/stepper-types.ts';
import { selectVaultById, selectVaultUnderlyingVault } from '../../selectors/vaults.ts';
import { selectSwapAggregatorsExistForChain, selectZapByChainId } from '../../selectors/zap.ts';
import type { BeefyStateFn } from '../../store/types.ts';
import { isDefined } from '../../utils/array-utils.ts';
import { getSwapAggregator } from '../instances.ts';
import * as cctp from './cctp/CCTPProvider.ts';
import {
  type AnyComposableStrategy,
  type IComposableStrategyStatic,
  type IComposerStrategyStatic,
  type IStrategy,
  isComposableStrategy,
  isZapTransactHelpers,
  type IZapStrategyStatic,
  type TransactHelpers,
  type ZapTransactHelpers,
} from './strategies/IStrategy.ts';
import {
  type AnyZapStrategyStatic,
  type ComposableStrategyId,
  type ComposerStrategyId,
  isBasicZapStrategyStatic,
  isComposableStrategyStatic,
  isComposerStrategyStatic,
  type StrategyIdToStatic,
  strategyLoadersById,
} from './strategies/strategies.ts';
import type {
  AnyStrategyId,
  StrategyIdToConfig,
  ZapStrategyConfig,
  ZapStrategyId,
} from './strategies/strategy-configs.ts';
import { VaultStrategy } from './strategies/vault/VaultStrategy.ts';
import {
  type DepositOption,
  type DepositQuote,
  type InputTokenAmount,
  type ITransactApi,
  type TransactQuote,
  type WithdrawOption,
  type WithdrawQuote,
} from './transact-types.ts';
import { type VaultTypeFromVault } from './vaults/IVaultType.ts';
import { getVaultTypeBuilder } from './vaults/vaults.ts';

type StrategyConstructorWithOptions<TId extends ZapStrategyId = ZapStrategyId> = {
  [K in TId]: {
    id: K;
    ctor: StrategyIdToStatic[K];
    options: StrategyIdToConfig<K>;
  };
}[TId];

type GenericStrategyConstructorWithOptions = {
  id: ZapStrategyId;
  ctor: AnyZapStrategyStatic;
  options: ZapStrategyConfig;
};

type ComposableStrategyConstructorWithOptions =
  StrategyConstructorWithOptions<ComposableStrategyId>;

export function isComposableStrategyConstructorWithOptions(
  strategy: GenericStrategyConstructorWithOptions
): strategy is ComposableStrategyConstructorWithOptions {
  return (
    isComposableStrategyStatic(strategy.ctor) &&
    strategy.id === strategy.ctor.id &&
    strategy.id === strategy.options.strategyId
  );
}

export class TransactApi implements ITransactApi {
  /**
   * Get transact helpers for a vault on a specific chain.
   * Used by CrossChainStrategy for destination chain operations.
   * Guarantees zap router exists (throws otherwise).
   */
  async getHelpersForChain(
    chainId: ChainEntity['id'],
    vaultId: VaultEntity['id'],
    getState: BeefyStateFn
  ): Promise<ZapTransactHelpers> {
    console.time(`[XChainPerf] getHelpersForChain(${chainId})`);
    const state = getState();
    const zap = selectZapByChainId(state, chainId);
    if (!zap) {
      console.timeEnd(`[XChainPerf] getHelpersForChain(${chainId})`);
      throw new Error(`No zap router configured for chain ${chainId}`);
    }

    const vault = selectVaultById(state, vaultId);
    if (vault.chainId !== chainId) {
      console.timeEnd(`[XChainPerf] getHelpersForChain(${chainId})`);
      throw new Error(`Vault ${vaultId} is on chain ${vault.chainId}, not ${chainId}`);
    }

    console.time(`[XChainPerf] getHelpersForChain.getVaultTypeFor(${chainId})`);
    const vaultType = await this.getVaultTypeFor(vault, getState);
    console.timeEnd(`[XChainPerf] getHelpersForChain.getVaultTypeFor(${chainId})`);

    console.time(`[XChainPerf] getHelpersForChain.getSwapAggregator(${chainId})`);
    const swapAggregator = await getSwapAggregator();
    console.timeEnd(`[XChainPerf] getHelpersForChain.getSwapAggregator(${chainId})`);

    console.timeEnd(`[XChainPerf] getHelpersForChain(${chainId})`);
    return {
      vault,
      vaultType,
      zap,
      swapAggregator,
      getState,
    };
  }

  protected async getHelpersForVault(
    vaultId: VaultEntity['id'],
    getState: BeefyStateFn
  ): Promise<TransactHelpers> {
    console.time(`[XChainPerf] getHelpersForVault(${vaultId})`);
    const state = getState();
    const vault = selectVaultById(state, vaultId);
    console.time(`[XChainPerf] getHelpersForVault.getVaultTypeFor(${vaultId})`);
    const vaultType = await this.getVaultTypeFor(vault, getState);
    console.timeEnd(`[XChainPerf] getHelpersForVault.getVaultTypeFor(${vaultId})`);
    const zap = selectZapByChainId(state, vault.chainId);

    console.time(`[XChainPerf] getHelpersForVault.getSwapAggregator(${vaultId})`);
    const swapAggregator = await getSwapAggregator();
    console.timeEnd(`[XChainPerf] getHelpersForVault.getSwapAggregator(${vaultId})`);

    console.timeEnd(`[XChainPerf] getHelpersForVault(${vaultId})`);
    return {
      vault,
      vaultType,
      zap,
      swapAggregator,
      getState,
    };
  }

  async fetchDepositOptionsFor(
    vaultId: VaultEntity['id'],
    getState: BeefyStateFn
  ): Promise<DepositOption[]> {
    const helpers = await this.getHelpersForVault(vaultId, getState);
    const { vaultType } = helpers;
    const options: DepositOption[] = [];

    // direct deposit option
    let vaultDepositOption: DepositOption | undefined = await vaultType.fetchDepositOption();

    // zaps
    const zapStrategies = await this.getZapStrategiesForVault(helpers);
    if (zapStrategies.length) {
      const zapOptions = await Promise.allSettled(
        zapStrategies.map(zapStrategy => zapStrategy.fetchDepositOptions())
      );
      zapOptions.forEach((result, i) => {
        if (isFulfilledResult(result)) {
          if (result.value.length) {
            if (zapStrategies[i].disableVaultDeposit) {
              vaultDepositOption = undefined;
            }
            options.push(...result.value);
          }
        }
      });

      // Cross-chain deposit options
      if (
        isZapTransactHelpers(helpers) &&
        cctp.isChainSupported(helpers.vault.chainId) &&
        zapStrategies.some(isComposableStrategy)
      ) {
        try {
          const { CrossChainStrategy } =
            await import('./strategies/cross-chain/CrossChainStrategy.ts');
          const xChainStrategy = new CrossChainStrategy({ strategyId: 'cross-chain' }, helpers);
          const xChainOptions = await xChainStrategy.fetchDepositOptions();
          options.push(...xChainOptions);
        } catch (err) {
          console.warn('Failed to load cross-chain deposit options:', err);
        }
      }
    }

    // if not disabled by a zap strategy, add the vault deposit option as the first item
    if (vaultDepositOption) {
      options.unshift(vaultDepositOption);
    }

    return options;
  }

  async fetchDepositQuotesFor(
    options: DepositOption[],
    amounts: InputTokenAmount[],
    getState: BeefyStateFn
  ): Promise<DepositQuote[]> {
    console.time('[XChainPerf] E: fetchDepositQuotesFor TOTAL');
    console.debug('[XChainPerf] E: fetchDepositQuotesFor START', {
      optionCount: options.length,
      strategyIds: options.map(o => o.strategyId),
      inputs: amounts.map(a => ({ token: a.token.symbol, amount: a.amount.toString(10) })),
    });

    const vaultId = options[0].vaultId;
    console.time('[XChainPerf] E.1: getHelpersForVault (re-quote)');
    const helpers = await this.getHelpersForVault(vaultId, getState);
    console.timeEnd('[XChainPerf] E.1: getHelpersForVault (re-quote)');

    // Init each strategy at most once
    const strategyIds = uniq(options.map(option => option.strategyId));
    console.time('[XChainPerf] E.2: getStrategyById (all strategies)');
    const strategies = await Promise.all(strategyIds.map(id => this.getStrategyById(id, helpers)));
    console.timeEnd('[XChainPerf] E.2: getStrategyById (all strategies)');
    const strategiesById = Object.fromEntries(
      strategies.map((strategy, i) => [strategyIds[i], strategy])
    );

    // Call beforeQuote hooks
    console.time('[XChainPerf] E.3: beforeQuote hooks');
    await Promise.allSettled(
      strategies.map(async strategy => {
        if (strategy.beforeQuote) {
          await strategy.beforeQuote();
        }
      })
    );
    console.timeEnd('[XChainPerf] E.3: beforeQuote hooks');

    // Get quotes
    console.time('[XChainPerf] E.4: fetchDepositQuote (all options)');
    const quotes = await Promise.allSettled(
      options.map(async option => {
        const strategy = strategiesById[option.strategyId];
        const quote = await strategy.fetchDepositQuote(amounts, option);
        if (!quote) {
          throw new Error(`Strategy ${option.strategyId} failed to return quote`);
        }
        return quote;
      })
    );
    console.timeEnd('[XChainPerf] E.4: fetchDepositQuote (all options)');

    const [fulfilled, rejected] = partition(quotes, isFulfilledResult);
    console.debug('[XChainPerf] E.4: quote results', {
      fulfilled: fulfilled.length,
      rejected: rejected.length,
    });
    const successfulQuotes = fulfilled
      .map(result => result.value)
      .filter(quote => !!quote)
      .flat();

    if (rejected.length > 0) {
      console.warn('fetchDepositQuotesFor had some rejections', rejected);
    }

    if (successfulQuotes.length > 0) {
      console.timeEnd('[XChainPerf] E: fetchDepositQuotesFor TOTAL');
      return successfulQuotes;
    }

    if (rejected.length > 0) {
      console.timeEnd('[XChainPerf] E: fetchDepositQuotesFor TOTAL');
      throw rejected[0].reason;
    }

    console.timeEnd('[XChainPerf] E: fetchDepositQuotesFor TOTAL');
    throw new Error('No quotes succeeded');
  }

  async fetchDepositStep(
    quote: TransactQuote,
    getState: BeefyStateFn,
    t: TFunction<Namespace>
  ): Promise<Step> {
    console.time('[XChainPerf] B: TransactApi.fetchDepositStep TOTAL');
    console.debug('[XChainPerf] B: TransactApi.fetchDepositStep START', {
      vaultId: quote.option.vaultId,
      strategyId: quote.option.strategyId,
    });

    console.time('[XChainPerf] B.1: getHelpersForVault');
    const helpers = await this.getHelpersForVault(quote.option.vaultId, getState);
    console.timeEnd('[XChainPerf] B.1: getHelpersForVault');

    console.time(`[XChainPerf] B.2: getStrategyById(${quote.option.strategyId})`);
    const strategy = await this.getStrategyById(quote.option.strategyId, helpers);
    console.timeEnd(`[XChainPerf] B.2: getStrategyById(${quote.option.strategyId})`);

    // Call beforeStep hooks
    console.time('[XChainPerf] B.3: strategy.beforeStep');
    if (strategy.beforeStep) {
      await strategy.beforeStep();
    }
    console.timeEnd('[XChainPerf] B.3: strategy.beforeStep');

    console.time('[XChainPerf] B.4: strategy.fetchDepositStep');
    const step = await strategy.fetchDepositStep(quote, t);
    console.timeEnd('[XChainPerf] B.4: strategy.fetchDepositStep');

    console.timeEnd('[XChainPerf] B: TransactApi.fetchDepositStep TOTAL');
    return step;
  }

  async fetchWithdrawOptionsFor(
    vaultId: VaultEntity['id'],
    getState: BeefyStateFn
  ): Promise<WithdrawOption[]> {
    const helpers = await this.getHelpersForVault(vaultId, getState);
    const { vaultType } = helpers;
    const options: WithdrawOption[] = [];

    // direct deposit option
    let vaultWithdrawOption: WithdrawOption | undefined = await vaultType.fetchWithdrawOption();

    // zaps
    const zapStrategies = await this.getZapStrategiesForVault(helpers);
    if (zapStrategies.length) {
      const zapOptions = await Promise.allSettled(
        zapStrategies.map(zapStrategy => zapStrategy.fetchWithdrawOptions())
      );
      zapOptions.forEach((result, i) => {
        if (isFulfilledResult(result)) {
          if (result.value.length) {
            if (zapStrategies[i].disableVaultWithdraw) {
              vaultWithdrawOption = undefined;
            }
            options.push(...result.value);
          }
        }
      });

      // Cross-chain withdraw options
      if (
        isZapTransactHelpers(helpers) &&
        cctp.isChainSupported(helpers.vault.chainId) &&
        zapStrategies.some(isComposableStrategy)
      ) {
        try {
          const { CrossChainStrategy } =
            await import('./strategies/cross-chain/CrossChainStrategy.ts');
          const xChainStrategy = new CrossChainStrategy({ strategyId: 'cross-chain' }, helpers);
          const xChainOptions = await xChainStrategy.fetchWithdrawOptions();
          options.push(...xChainOptions);
        } catch (err) {
          console.warn('Failed to load cross-chain withdraw options:', err);
        }
      }
    }

    // if not disabled by a zap strategy, add the vault withdraw option as the first item
    if (vaultWithdrawOption) {
      options.unshift(vaultWithdrawOption);
    }

    return options;
  }

  async fetchWithdrawQuotesFor(
    options: WithdrawOption[],
    amounts: InputTokenAmount[],
    getState: BeefyStateFn
  ): Promise<WithdrawQuote[]> {
    const vaultId = options[0].vaultId;
    const helpers = await this.getHelpersForVault(vaultId, getState);

    // Init each strategy at most once
    const strategyIds = uniq(options.map(option => option.strategyId));
    const strategies = await Promise.all(strategyIds.map(id => this.getStrategyById(id, helpers)));
    const strategiesById = Object.fromEntries(
      strategies.map((strategy, i) => [strategyIds[i], strategy])
    );

    // Call beforeQuote hooks
    await Promise.allSettled(
      strategies.map(async strategy => {
        if (strategy.beforeQuote) {
          await strategy.beforeQuote();
        }
      })
    );

    // Get quotes
    const quotes = await Promise.allSettled(
      options.map(option => {
        const strategy = strategiesById[option.strategyId];
        return strategy.fetchWithdrawQuote(amounts, option);
      })
    );

    const [fulfilled, rejected] = partition(quotes, isFulfilledResult);
    const successfulQuotes = fulfilled
      .map(result => result.value)
      .filter(quote => !!quote)
      .flat();

    if (rejected.length > 0) {
      console.warn('fetchWithdrawQuotesFor had some rejections', rejected);
    }

    if (successfulQuotes.length > 0) {
      return successfulQuotes;
    }

    if (rejected.length > 0) {
      throw rejected[0].reason;
    }

    throw new Error('No quotes succeeded');
  }

  private async getVaultTypeFor<T extends VaultEntity>(
    vault: T,
    getState: BeefyStateFn
  ): Promise<VaultTypeFromVault<T>> {
    const builder = getVaultTypeBuilder(vault);
    if (!builder) {
      throw new Error(
        `Vault ${vault.id} has type "${vault.type}", but there is no vault type builder`
      );
    }

    const vaultType = await builder(vault, getState);
    if (!vaultType) {
      throw new Error(`Vault ${vault.id} has type "${vault.type}", but builder failed`);
    }

    return vaultType;
  }

  async fetchWithdrawStep(
    quote: TransactQuote,
    getState: BeefyStateFn,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const helpers = await this.getHelpersForVault(quote.option.vaultId, getState);
    const strategy = await this.getStrategyById(quote.option.strategyId, helpers);

    // Call beforeStep hooks
    if (strategy.beforeStep) {
      await strategy.beforeStep();
    }

    return await strategy.fetchWithdrawStep(quote, t);
  }

  async fetchVaultHasZap(vaultId: VaultEntity['id'], getState: BeefyStateFn): Promise<boolean> {
    const helpers = await this.getHelpersForVault(vaultId, getState);

    // No zap in config
    if (!helpers.vault.zaps || helpers.vault.zaps.length === 0) {
      return false;
    }

    // Cowcentrated like are marked as not having zap on chains with no aggregator
    // [even though CLM Pools technically have a zap from token0/1 in to RP]
    if (
      isCowcentratedLikeVault(helpers.vault) &&
      !selectSwapAggregatorsExistForChain(getState(), helpers.vault.chainId)
    ) {
      return false;
    }

    // No strategies could be initialized
    const zapStrategies = await this.getZapStrategiesForVault(helpers);
    if (!zapStrategies.length) {
      return false;
    }

    const options = await allFulfilled(
      zapStrategies.map(zapStrategy => zapStrategy.fetchDepositOptions())
    );

    // Must have at least 1 deposit option from any strategy
    return options.flat().length > 0;
  }

  async getZapStrategiesForVault(helpers: TransactHelpers): Promise<IStrategy[]> {
    const { vault } = helpers;

    if (!vault.zaps || vault.zaps.length === 0) {
      return [];
    }

    if (!isZapTransactHelpers(helpers)) {
      console.warn(`Vault ${vault.id} has zaps defined but ${vault.chainId} has no zap config`);
      return [];
    }

    console.time(`[XChainPerf] getZapStrategiesForVault(${vault.id})`);
    console.debug('[XChainPerf] getZapStrategiesForVault START', {
      vaultId: vault.id,
      zapCount: vault.zaps.length,
      zapStrategyIds: vault.zaps.map(z => z.strategyId),
    });

    const strategies = await Promise.all(
      vault.zaps.map(async zapConfig => {
        if (!zapConfig.strategyId) {
          console.warn(`Vault ${vault.id} has a zap config but no strategyId specified`);
          return undefined;
        }

        try {
          console.time(`[XChainPerf] buildZapStrategy(${zapConfig.strategyId}@${vault.id})`);
          const strat = await this.buildZapStrategy(zapConfig, helpers);
          console.timeEnd(`[XChainPerf] buildZapStrategy(${zapConfig.strategyId}@${vault.id})`);
          return strat;
        } catch (err: unknown) {
          console.error(
            `Vault ${vault.id} failed to build strategy "${zapConfig.strategyId}"`,
            err
          );
          return undefined;
        }
      })
    );

    const result = strategies.filter(isDefined);
    console.timeEnd(`[XChainPerf] getZapStrategiesForVault(${vault.id})`);
    console.debug('[XChainPerf] getZapStrategiesForVault DONE', {
      vaultId: vault.id,
      loadedCount: result.length,
      ids: result.map(s => s.id),
    });
    return result;
  }

  private async getZapStrategyConstructorsForVault(
    helpers: TransactHelpers
  ): Promise<GenericStrategyConstructorWithOptions[]> {
    const { vault } = helpers;

    if (!vault.zaps || vault.zaps.length === 0) {
      return [];
    }

    if (!isZapTransactHelpers(helpers)) {
      console.warn(`Vault ${vault.id} has zaps defined but ${vault.chainId} has no zap config`);
      return [];
    }

    const strategyConstructors = await Promise.all(
      vault.zaps.map(async zapConfig => {
        if (!zapConfig.strategyId) {
          console.warn(`Vault ${vault.id} has a zap config but no strategyId specified`);
          return undefined;
        }

        const loader = strategyLoadersById[zapConfig.strategyId];
        if (!loader) {
          console.warn(
            `Vault ${vault.id} has a zap config with an unknown strategy "${zapConfig.strategyId}"`
          );
          return undefined;
        }

        try {
          const ctor = await loader();
          if (ctor.id !== zapConfig.strategyId) {
            console.error(
              `Constructor for "${zapConfig.strategyId}" has unexpected id "${ctor.id}"`
            );
            return undefined;
          }

          return {
            id: ctor.id,
            ctor,
            options: zapConfig as StrategyIdToConfig<typeof ctor.id>,
          } satisfies GenericStrategyConstructorWithOptions;
        } catch (err: unknown) {
          console.error(`Vault ${vault.id} failed to load strategy "${zapConfig.strategyId}"`, err);
          return undefined;
        }
      })
    );

    return strategyConstructors.filter(isDefined);
  }

  private async buildZapStrategy<T extends ZapStrategyConfig>(
    strategyConfig: T,
    helpers: ZapTransactHelpers
  ): Promise<IStrategy> {
    const loader = strategyLoadersById[strategyConfig.strategyId];
    if (!loader) {
      throw new Error(`Strategy "${strategyConfig.strategyId}" not found`);
    }

    const ctor = await loader();

    if (isComposerStrategyStatic(ctor)) {
      const underlyingStrategy = await this.getComposableStrategyForZap(helpers);
      const genericCtor = ctor as IComposerStrategyStatic;
      return new genericCtor(
        strategyConfig as StrategyIdToConfig<ComposerStrategyId>,
        helpers,
        underlyingStrategy
      );
    }

    if (isComposableStrategyStatic(ctor)) {
      const genericCtor = ctor as IComposableStrategyStatic;
      return new genericCtor(strategyConfig, helpers);
    }

    if (isBasicZapStrategyStatic(ctor)) {
      const genericCtor = ctor as IZapStrategyStatic;
      return new genericCtor(strategyConfig, helpers);
    }

    throw new Error(`Strategy "${strategyConfig.strategyId}" is an unknown type`);
  }

  private async getComposableStrategyForZap(
    helpers: ZapTransactHelpers
  ): Promise<AnyComposableStrategy> {
    const { getState, vault } = helpers;
    const underlyingVault = selectVaultUnderlyingVault(getState(), vault.id);
    const underlyingHelpers = await this.getHelpersForVault(underlyingVault.id, getState);
    if (!isZapTransactHelpers(underlyingHelpers)) {
      throw new Error(
        `Underlying vault ${underlyingVault.id} has no zap contract on chain ${underlyingVault.chainId}`
      );
    }
    const underlyingStrategies = await this.getZapStrategyConstructorsForVault(underlyingHelpers);
    const composableUnderlyingStrategies = underlyingStrategies.filter(
      isComposableStrategyConstructorWithOptions
    );
    if (composableUnderlyingStrategies.length === 0) {
      throw new Error(
        `Underlying vault ${underlyingVault.id} of ${vault.id} has no composable strategies`
      );
    }

    const underlyingStrategy = composableUnderlyingStrategies[0];
    if (composableUnderlyingStrategies.length > 1) {
      console.warn(
        `Underlying vault ${underlyingVault.id} of ${vault.id} has multiple composable strategies, using the first ${underlyingStrategy.ctor.id}`
      );
    }

    const ctor = underlyingStrategy.ctor as new (
      options: ZapStrategyConfig,
      helpers: ZapTransactHelpers
    ) => AnyComposableStrategy;
    const options = underlyingStrategy.options;
    return new ctor(options, underlyingHelpers);
  }

  private async getStrategyById(
    strategyId: AnyStrategyId,
    helpers: TransactHelpers
  ): Promise<IStrategy> {
    console.time(`[XChainPerf] getStrategyById(${strategyId})`);
    const { vault, vaultType } = helpers;

    if (strategyId === 'vault') {
      console.timeEnd(`[XChainPerf] getStrategyById(${strategyId})`);
      return new VaultStrategy(vaultType);
    }

    if (!isZapTransactHelpers(helpers)) {
      console.timeEnd(`[XChainPerf] getStrategyById(${strategyId})`);
      throw new Error(`Strategy "${strategyId}" requires zap contract`);
    }

    // Cross-chain strategy is not in vault.zaps — instantiate inline
    if (strategyId === 'cross-chain') {
      const result = await this.buildZapStrategy({ strategyId: 'cross-chain' }, helpers);
      console.timeEnd(`[XChainPerf] getStrategyById(${strategyId})`);
      return result;
    }

    if (!vault.zaps) {
      console.timeEnd(`[XChainPerf] getStrategyById(${strategyId})`);
      throw new Error(`Vault ${vault.id} has no zaps`);
    }

    const zap = vault.zaps.find(zap => zap.strategyId === strategyId);
    if (!zap) {
      console.timeEnd(`[XChainPerf] getStrategyById(${strategyId})`);
      throw new Error(`Vault ${vault.id} has no zap with strategy "${strategyId}"`);
    }

    const result = await this.buildZapStrategy(zap, helpers);
    console.timeEnd(`[XChainPerf] getStrategyById(${strategyId})`);
    return result;
  }
}
