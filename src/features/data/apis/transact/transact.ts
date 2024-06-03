import type {
  DepositOption,
  DepositQuote,
  InputTokenAmount,
  ITransactApi,
  TransactQuote,
  WithdrawOption,
  WithdrawQuote,
} from './transact-types';
import { partition } from 'lodash';
import type { VaultEntity } from '../../entities/vault';
import { isCowcentratedLiquidityVault, isStandardVault } from '../../entities/vault';
import type { GetStateFn } from '../../../../redux-types';
import { selectVaultById } from '../../selectors/vaults';
import {
  type IStrategy,
  isZapTransactHelpers,
  type StrategyOptions,
  type TransactHelpers,
} from './strategies/IStrategy';
import { allFulfilled, isFulfilledResult } from '../../../../helpers/promises';
import type { Namespace, TFunction } from 'react-i18next';
import type { Step } from '../../reducers/wallet/stepper';
import { type VaultTypeFromVault } from './vaults/IVaultType';
import { strategyBuildersById } from './strategies';
import { getVaultTypeBuilder } from './vaults';
import { uniq } from 'lodash-es';
import { VaultStrategy } from './strategies/vault/VaultStrategy';
import { selectZapByChainId } from '../../selectors/zap';
import { getSwapAggregator } from '../instances';

export class TransactApi implements ITransactApi {
  protected async getHelpersForVault(
    vaultId: VaultEntity['id'],
    getState: GetStateFn
  ): Promise<TransactHelpers> {
    const state = getState();
    const vault = selectVaultById(state, vaultId);
    const vaultType = await this.getVaultTypeFor(vault, getState);
    const zap = selectZapByChainId(state, vault.chainId);

    return {
      vault,
      vaultType,
      zap,
      swapAggregator: await getSwapAggregator(),
      getState,
    };
  }

  async fetchDepositOptionsFor(
    vaultId: VaultEntity['id'],
    getState: GetStateFn
  ): Promise<DepositOption[]> {
    const helpers = await this.getHelpersForVault(vaultId, getState);
    const { vaultType } = helpers;
    const options: DepositOption[] = [];

    // direct deposit option
    options.push(await vaultType.fetchDepositOption());

    // zaps
    const zapStrategies = await this.getZapStrategiesForVault(helpers);
    if (zapStrategies.length) {
      const zapOptions = await allFulfilled(
        zapStrategies.map(zapStrategy => zapStrategy.fetchDepositOptions())
      );
      options.push(...zapOptions.flat());
    }

    return options;
  }

  async fetchDepositQuotesFor(
    options: DepositOption[],
    amounts: InputTokenAmount[],
    getState: GetStateFn
  ): Promise<DepositQuote[]> {
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
      options.map(async option => {
        const strategy = strategiesById[option.strategyId];
        const quote = await strategy.fetchDepositQuote(amounts, option);
        if (!quote) {
          throw new Error(`Strategy ${option.strategyId} failed to return quote`);
        }
        return quote;
      })
    );

    const [fulfilled, rejected] = partition(quotes, isFulfilledResult);
    const successfulQuotes = fulfilled
      .map(result => result.value)
      .filter(quote => !!quote)
      .flat();

    if (rejected.length > 0) {
      console.warn('fetchDepositQuotesFor had some rejections', rejected);
    }

    if (successfulQuotes.length > 0) {
      return successfulQuotes;
    }

    if (rejected.length > 0) {
      throw rejected[0].reason;
    }

    throw new Error('No quotes succeeded');
  }

  async fetchDepositStep(
    quote: TransactQuote,
    getState: GetStateFn,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const helpers = await this.getHelpersForVault(quote.option.vaultId, getState);
    const strategy = await this.getStrategyById(quote.option.strategyId, helpers);

    // Call beforeStep hooks
    if (strategy.beforeStep) {
      await strategy.beforeStep();
    }

    return await strategy.fetchDepositStep(quote, t);
  }

  async fetchWithdrawOptionsFor(
    vaultId: VaultEntity['id'],
    getState: GetStateFn
  ): Promise<WithdrawOption[]> {
    const helpers = await this.getHelpersForVault(vaultId, getState);
    const { vaultType } = helpers;
    const options: WithdrawOption[] = [];

    // direct deposit option
    options.push(await vaultType.fetchWithdrawOption());

    // zaps
    const zapStrategies = await this.getZapStrategiesForVault(helpers);
    if (zapStrategies.length) {
      const zapOptions = await allFulfilled(
        zapStrategies.map(zapStrategy => zapStrategy.fetchWithdrawOptions())
      );
      options.push(...zapOptions.flat());
    } else {
      console.debug('no zap strategies for', vaultId); // this is OK
    }

    return options;
  }

  async fetchWithdrawQuotesFor(
    options: WithdrawOption[],
    amounts: InputTokenAmount[],
    getState: GetStateFn
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
    getState: GetStateFn
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
    getState: GetStateFn,
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

  async fetchVaultHasZap(vaultId: VaultEntity['id'], getState: GetStateFn): Promise<boolean> {
    const helpers = await this.getHelpersForVault(vaultId, getState);
    const zapStrategies = await this.getZapStrategiesForVault(helpers);
    if (!zapStrategies.length) {
      return false;
    }

    const options = await allFulfilled(
      zapStrategies.map(zapStrategy => zapStrategy.fetchDepositOptions())
    );

    return options.flat().length > 0;
  }

  private async getZapStrategiesForVault(helpers: TransactHelpers): Promise<IStrategy[]> {
    const { vault } = helpers;

    // Only standard/cow vaults are supported so far
    if (!isStandardVault(vault) && !isCowcentratedLiquidityVault(vault)) {
      return [];
    }

    if (!vault.zaps || vault.zaps.length === 0) {
      return [];
    }

    if (!isZapTransactHelpers(helpers)) {
      console.warn(`Vault ${vault.id} has zaps defined but ${vault.chainId} has no zap config`);
      return [];
    }

    const strategies = await Promise.all(
      vault.zaps.map(async zapConfig => {
        if (!zapConfig.strategyId) {
          console.warn(`Vault ${vault.id} has a zap config but no strategyId specified`);
          return undefined;
        }

        const builder = strategyBuildersById[zapConfig.strategyId];
        if (!builder) {
          console.warn(
            `Vault ${vault.id} has a zap config with an unknown strategy "${zapConfig.strategyId}"`
          );
          return undefined;
        }

        try {
          return await builder(zapConfig, helpers);
        } catch (err: unknown) {
          console.error(
            `Vault ${vault.id} failed to build strategy "${zapConfig.strategyId}"`,
            err
          );
          return undefined;
        }
      })
    );

    return strategies.filter((strategy): strategy is IStrategy => !!strategy);
  }

  private async getStrategyById(
    strategyId: StrategyOptions['strategyId'] | 'vault' | 'cowcentrated',
    helpers: TransactHelpers
  ): Promise<IStrategy> {
    const { vault, vaultType } = helpers;

    if (strategyId === 'vault') {
      // Wrapper for common interface
      return new VaultStrategy(vaultType);
    }

    // if (strategyId === 'cowcentrated' && isCowcentratedVaultType(vaultType)) {
    //   console.log('returnning cow strat');
    //   return new CowcentratedStrategy(vaultType);
    // }

    if (!isZapTransactHelpers(helpers)) {
      throw new Error(`Strategy "${strategyId}" requires zap contract`);
    }

    if (!isStandardVault(vault) && !isCowcentratedLiquidityVault(vault)) {
      // This should never happen
      throw new Error(`Vault ${vault.id} is not a standard vault and does not support zaps`);
    }

    if (!vault.zaps && !isCowcentratedLiquidityVault(vault)) {
      throw new Error(`Vault ${vault.id} has no zaps`);
    }

    const zap = vault.zaps.find(zap => zap.strategyId === strategyId);
    if (!zap) {
      throw new Error(`Vault ${vault.id} has no zap with strategy "${strategyId}"`);
    }

    const builder = strategyBuildersById[zap.strategyId];
    if (!builder) {
      throw new Error(
        `Vault ${vault.id} has a zap config with an unknown strategy "${zap.strategyId}"`
      );
    }

    return await builder(zap, helpers);
  }
}
