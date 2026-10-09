import { uniqBy } from 'lodash-es';
import type { Namespace, TFunction } from 'react-i18next';
import { toWeiString } from '../../../../../../helpers/big-number.ts';
import { isTokenEqual, type TokenEntity } from '../../../../entities/token.ts';
import type { Step } from '../../../../reducers/wallet/stepper-types.ts';
import { selectTransactSlippage } from '../../../../selectors/transact.ts';
import { slipBy } from '../../helpers/amounts.ts';
import { Balances } from '../../helpers/Balances.ts';
import { pickTokens } from '../../helpers/tokens.ts';
import { getTokenAddress, NO_RELAY } from '../../helpers/zap.ts';
import type {
  DepositOption,
  DepositQuote,
  InputTokenAmount,
  WithdrawOption,
  WithdrawQuote,
} from '../../transact-types.ts';
import type { IStandardVaultType, IVaultType } from '../../vaults/IVaultType.ts';
import type { OrderInput, OrderOutput, UserlessZapRequest } from '../../zap/types.ts';
import {
  type IStrategy,
  isZapTransactHelpers,
  type TransactHelpers,
  type UserlessZapDepositBreakdown,
  type UserlessZapWithdrawBreakdown,
  type ZapTransactHelpers,
} from '../IStrategy.ts';

const strategyId = 'vault';
type StrategyId = typeof strategyId;

/**
 * Wraps an IVaultType as an IStrategy
 *
 * The quote and step methods stay pure delegation, so the plain same-token route keeps approving the
 * vault and calling deposit()/withdraw() directly. The breakdown methods below are the same route
 * expressed as a zap order, which only a decorator (today: BoostZapStrategy) ever asks for.
 */
export class VaultStrategy<T extends IVaultType> implements IStrategy<StrategyId> {
  public static readonly id = strategyId;
  public readonly id = strategyId;

  constructor(
    protected readonly vaultType: T,
    protected readonly helpers: TransactHelpers
  ) {}

  async fetchDepositOptions(): Promise<DepositOption[]> {
    return [await this.vaultType.fetchDepositOption()];
  }

  async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: DepositOption
  ): Promise<DepositQuote> {
    return this.vaultType.fetchDepositQuote(inputs, option);
  }

  async fetchDepositStep(quote: DepositQuote, t: TFunction<Namespace>): Promise<Step> {
    return this.vaultType.fetchDepositStep(quote, t);
  }

  async fetchWithdrawOptions(): Promise<WithdrawOption[]> {
    return [await this.vaultType.fetchWithdrawOption()];
  }

  async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: WithdrawOption
  ): Promise<WithdrawQuote> {
    return this.vaultType.fetchWithdrawQuote(inputs, option);
  }

  async fetchWithdrawStep(quote: WithdrawQuote, t: TFunction<Namespace>): Promise<Step> {
    return this.vaultType.fetchWithdrawStep(quote, t);
  }

  getHelpers(): TransactHelpers {
    return this.helpers;
  }

  async canAcceptTokenAsDeposit(token: TokenEntity): Promise<boolean> {
    const zappable = this.asZappable();
    return !!zappable && isTokenEqual(token, zappable.vaultType.depositToken);
  }

  async canEmitTokenAsWithdraw(token: TokenEntity): Promise<boolean> {
    return this.canAcceptTokenAsDeposit(token);
  }

  async fetchDepositUserlessZapBreakdown(
    quote: DepositQuote
  ): Promise<UserlessZapDepositBreakdown> {
    const { vaultType, helpers } = this.requireZappable();
    const slippage = selectTransactSlippage(helpers.getState());
    const minBalances = new Balances(quote.inputs);

    const vaultDeposit = await vaultType.fetchZapDeposit({
      inputs: quote.inputs,
      from: helpers.zap.router,
    });
    minBalances.subtractMany(vaultDeposit.inputs);
    minBalances.addMany(vaultDeposit.minOutputs);

    const inputs: OrderInput[] = quote.inputs.map(input => ({
      token: getTokenAddress(input.token),
      amount: toWeiString(input.amount, input.token.decimals),
    }));

    // ppfs is read live by fetchZapDeposit, so the shares still need slipping
    const requiredOutputs: OrderOutput[] = vaultDeposit.outputs.map(output => ({
      token: getTokenAddress(output.token),
      minOutputAmount: toWeiString(
        slipBy(output.amount, slippage, output.token.decimals),
        output.token.decimals
      ),
    }));
    const dustOutputs: OrderOutput[] = quote.outputs.concat(quote.inputs).map(item => ({
      token: getTokenAddress(item.token),
      minOutputAmount: '0',
    }));

    return {
      zapRequest: {
        order: {
          inputs,
          outputs: uniqBy(requiredOutputs.concat(dustOutputs), output => output.token),
          relay: NO_RELAY,
        },
        steps: [vaultDeposit.zap],
      } satisfies UserlessZapRequest,
      expectedTokens: vaultDeposit.outputs.map(output => output.token),
      minBalances,
    };
  }

  async fetchWithdrawUserlessZapBreakdown(
    quote: WithdrawQuote
  ): Promise<UserlessZapWithdrawBreakdown> {
    const { vaultType, helpers } = this.requireZappable();
    const slippage = selectTransactSlippage(helpers.getState());

    const vaultWithdraw = await vaultType.fetchZapWithdraw({
      inputs: quote.inputs,
      from: helpers.zap.router,
    });

    // the order is paid in shares, while the quote inputs are in deposit token
    const inputs: OrderInput[] = vaultWithdraw.inputs.map(input => ({
      token: getTokenAddress(input.token),
      amount: toWeiString(input.amount, input.token.decimals),
    }));

    const requiredOutputs: OrderOutput[] = vaultWithdraw.outputs.map(output => ({
      token: getTokenAddress(output.token),
      minOutputAmount: toWeiString(
        slipBy(output.amount, slippage, output.token.decimals),
        output.token.decimals
      ),
    }));
    const dustOutputs: OrderOutput[] = pickTokens(
      vaultWithdraw.inputs,
      quote.outputs,
      quote.inputs
    ).map(token => ({
      token: getTokenAddress(token),
      minOutputAmount: '0',
    }));

    return {
      zapRequest: {
        order: {
          inputs,
          outputs: uniqBy(requiredOutputs.concat(dustOutputs), output => output.token),
          relay: NO_RELAY,
        },
        steps: [vaultWithdraw.zap],
      } satisfies UserlessZapRequest,
      expectedTokens: vaultWithdraw.outputs.map(output => output.token),
    };
  }

  /** Only a standard vault on a chain with a zap router can express its route as an order */
  protected asZappable():
    | { vaultType: IStandardVaultType; helpers: ZapTransactHelpers }
    | undefined {
    const { vaultType, helpers } = this;
    // a generic T is not narrowed by the id check, so the cast has to hop via IVaultType
    if (vaultType.id !== 'standard' || !isZapTransactHelpers(helpers)) {
      return undefined;
    }
    return { vaultType: vaultType as IVaultType as IStandardVaultType, helpers };
  }

  protected requireZappable() {
    const zappable = this.asZappable();
    if (!zappable) {
      throw new Error(
        `Vault ${this.vaultType.vault.id} cannot build a zap order for its own route`
      );
    }
    return zappable;
  }
}
