import type { IZapStrategy, IZapStrategyStatic, ZapTransactHelpers } from '../IStrategy.ts';
import type { CrossChainStrategyConfig } from '../strategy-configs.ts';
import type { CrossChainDepositOption, CrossChainWithdrawOption } from '../../transact-types.ts';
import type { InputTokenAmount } from '../../transact-types.ts';

const strategyId = 'cross-chain';
type StrategyId = typeof strategyId;

class CrossChainStrategyImpl implements IZapStrategy<StrategyId> {
  public static readonly id = strategyId;
  public readonly id = strategyId;

  constructor(
    protected options: CrossChainStrategyConfig,
    protected helpers: ZapTransactHelpers
  ) {}

  async fetchDepositOptions(): Promise<CrossChainDepositOption[]> {
    throw new Error('CrossChainStrategy not yet implemented');
  }

  async fetchDepositQuote(
    _inputs: InputTokenAmount[],
    _option: CrossChainDepositOption
  ): Promise<never> {
    throw new Error('CrossChainStrategy not yet implemented');
  }

  async fetchDepositStep(): Promise<never> {
    throw new Error('CrossChainStrategy not yet implemented');
  }

  async fetchWithdrawOptions(): Promise<CrossChainWithdrawOption[]> {
    throw new Error('CrossChainStrategy not yet implemented');
  }

  async fetchWithdrawQuote(
    _inputs: InputTokenAmount[],
    _option: CrossChainWithdrawOption
  ): Promise<never> {
    throw new Error('CrossChainStrategy not yet implemented');
  }

  async fetchWithdrawStep(): Promise<never> {
    throw new Error('CrossChainStrategy not yet implemented');
  }
}

export const CrossChainStrategy = CrossChainStrategyImpl satisfies IZapStrategyStatic<StrategyId>;
