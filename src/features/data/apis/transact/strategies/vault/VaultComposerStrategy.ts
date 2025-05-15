import { uniqBy } from 'lodash-es';
import type { Namespace, TFunction } from 'react-i18next';
import { toWeiString } from '../../../../../../helpers/big-number.ts';
import { zapExecuteOrder } from '../../../../actions/wallet/zap.ts';
import type { TokenEntity, TokenErc20 } from '../../../../entities/token.ts';
import {
  isCowcentratedStandardVault,
  type VaultStandardCowcentrated,
} from '../../../../entities/vault.ts';
import type { Step } from '../../../../reducers/wallet/stepper-types.ts';
import { selectErc20TokenByAddress, selectTokenByAddress } from '../../../../selectors/tokens.ts';
import { selectTransactSlippage } from '../../../../selectors/transact.ts';
import type { BeefyThunk } from '../../../../store/types.ts';
import { slipBy } from '../../helpers/amounts.ts';
import { onlyOneInput } from '../../helpers/options.ts';
import { calculatePriceImpact, ZERO_FEE } from '../../helpers/quotes.ts';
import { pickTokens } from '../../helpers/tokens.ts';
import { NO_RELAY } from '../../helpers/zap.ts';
import type {
  CowcentratedVaultDepositOption,
  CowcentratedVaultDepositQuote,
  CowcentratedVaultWithdrawOption,
  CowcentratedVaultWithdrawQuote,
  DepositOption,
  DepositQuote,
  InputTokenAmount,
  VaultComposerDepositOption,
  VaultComposerWithdrawOption,
  VaultComposerZapDepositQuote,
  VaultComposerZapWithdrawQuote,
  WithdrawOption,
  WithdrawQuote,
  ZapQuoteStep,
  ZapStrategyIdToDepositOption,
  ZapStrategyIdToDepositQuote,
  ZapStrategyIdToWithdrawOption,
  ZapStrategyIdToWithdrawQuote,
} from '../../transact-types.ts';
import {
  type ICowcentratedVaultType,
  isCowcentratedVaultType,
  isStandardVaultType,
  type IStandardVaultType,
} from '../../vaults/IVaultType.ts';
import type { OrderInput, OrderOutput, UserlessZapRequest, ZapStep } from '../../zap/types.ts';
import type {
  AnyComposableStrategy,
  IComposableStrategy,
  IComposerStrategy,
  IComposerStrategyStatic,
  ZapTransactHelpers,
} from '../IStrategy.ts';
import type { VaultComposerStrategyConfig } from '../strategy-configs.ts';

const strategyId = 'vault-composer';
type StrategyId = typeof strategyId;

class VaultComposerStrategyImpl implements IComposerStrategy<StrategyId> {
  public static readonly id = strategyId;
  public static readonly composer = true;
  public readonly id = strategyId;
  public readonly disableVaultWithdraw = true;

  protected readonly vault: VaultStandardCowcentrated;
  protected readonly vaultType: IStandardVaultType;
  protected readonly underlyingStrategy: IComposableStrategy<'cowcentrated'>;
  protected readonly underlyingVaultType: ICowcentratedVaultType;
  protected readonly shareToken: TokenErc20;
  protected readonly depositToken: TokenEntity;

  constructor(
    protected options: VaultComposerStrategyConfig,
    protected helpers: ZapTransactHelpers,
    underlying: AnyComposableStrategy
  ) {
    const { vault, vaultType, getState } = this.helpers;
    if (!isCowcentratedStandardVault(vault)) {
      throw new Error('Vault is not a cowcentrated standard vault');
    }
    if (!isStandardVaultType(vaultType)) {
      throw new Error('Vault type is not standard');
    }
    this.vault = vault;
    this.vaultType = vaultType;
    this.shareToken = selectErc20TokenByAddress(getState(), vault.chainId, vault.contractAddress);
    this.depositToken = selectTokenByAddress(getState(), vault.chainId, vault.depositTokenAddress);

    if (underlying.id !== 'cowcentrated') {
      // TODO support other underlying types or just rename this strategy CowcentratedGovComposerStrategy
      throw new Error('Underlying strategy must be cowcentrated');
    }
    this.underlyingStrategy = underlying;

    const { vaultType: underlyingVaultType } = underlying.getHelpers();
    if (!isCowcentratedVaultType(underlyingVaultType)) {
      // TODO support other underlying types or just rename this strategy CowcentratedGovComposerStrategy
      throw new Error('Underlying vault type is not cowcentrated');
    }
    this.underlyingVaultType = underlyingVaultType;
  }

  async fetchDepositOptions(): Promise<VaultComposerDepositOption[]> {
    const options = await this.underlyingStrategy.fetchDepositOptions();
    const vaultOption =
      (await this.underlyingVaultType.fetchDepositOption()) as CowcentratedVaultDepositOption;
    return [vaultOption, ...options].map(option => ({
      ...option,
      strategyId,
      vaultId: this.vault.id,
      underlyingOption: option,
    }));
  }

  async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: VaultComposerDepositOption
  ): Promise<VaultComposerZapDepositQuote> {
    const { underlyingOption } = option;
    if (underlyingOption.strategyId === 'vault') {
      const underlyingQuote = (await this.underlyingVaultType.fetchDepositQuote(
        inputs,
        underlyingOption
      )) as CowcentratedVaultDepositQuote;

      const steps: ZapQuoteStep[] = [
        {
          type: 'deposit',
          inputs: underlyingQuote.inputs,
        },
        {
          type: 'deposit',
          inputs: underlyingQuote.outputs,
        },
      ];

      const modOutputs = underlyingQuote.outputs.map(output => ({
        ...output,
        token: this.shareToken,
      }));

      return {
        ...underlyingQuote,
        option,
        steps,
        outputs: modOutputs,
        allowances: underlyingQuote.allowances.map(allowance => ({
          ...allowance,
          spenderAddress: this.helpers.zap.manager,
        })),
        priceImpact: calculatePriceImpact(
          underlyingQuote.inputs,
          modOutputs,
          underlyingQuote.returned,
          this.helpers.getState()
        ),
        strategyId: 'vault-composer',
        vaultType: 'standard',
        subStrategy: 'vault',
        fee: ZERO_FEE,
        underlyingQuote,
      };
    }

    if (!this.isMatchingDepositOption(underlyingOption)) {
      throw new Error('Invalid underlying deposit option');
    }

    // Quote to be fetched via underlying strategy
    const underlyingQuote = await this.underlyingStrategy.fetchDepositQuote(
      inputs,
      underlyingOption
    );

    // const modOutputs = underlyingQuote.outputs.map(output => ({
    //   token: this.shareToken,
    //   amount: output.amount,
    // }));

    return {
      ...underlyingQuote,
      outputs: underlyingQuote.outputs,
      steps: underlyingQuote.steps.concat({
        type: 'deposit',
        inputs: underlyingQuote.outputs,
      }),
      priceImpact: calculatePriceImpact(
        underlyingQuote.inputs,
        underlyingQuote.outputs,
        underlyingQuote.returned,
        this.helpers.getState()
      ),
      vaultType: 'standard',
      strategyId: 'vault-composer',
      subStrategy: 'strategy',
      underlyingQuote,
      option,
    };
  }

  protected isMatchingDepositOption(
    option: DepositOption
  ): option is ZapStrategyIdToDepositOption<typeof this.underlyingStrategy.id> {
    return option.strategyId === this.underlyingStrategy.id;
  }

  protected isMatchingDepositQuote(
    option: DepositQuote
  ): option is ZapStrategyIdToDepositQuote<typeof this.underlyingStrategy.id> {
    return option.strategyId === this.underlyingStrategy.id;
  }

  async fetchDepositStep(
    quote: VaultComposerZapDepositQuote,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const { underlyingQuote } = quote;

    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const state = this.helpers.getState();
      const slippage = selectTransactSlippage(state);

      if (quote.underlyingQuote.strategyId === 'vault') {
        const depositZap = await this.underlyingVaultType.fetchZapDeposit({
          inputs: underlyingQuote.inputs,
          from: this.helpers.zap.router,
        });

        const vaultDepositZap = await this.vaultType.fetchZapDeposit({
          inputs: [
            {
              token: this.depositToken,
              amount: underlyingQuote.outputs[0].amount, // min expected in case add liquidity slipped
              max: true, // but we call depositAll
            },
          ],
          from: this.helpers.zap.router,
        });

        const dustOutputs: OrderOutput[] = pickTokens(
          quote.outputs,
          quote.inputs,
          quote.returned
        ).map(token => ({
          token: token.address,
          minOutputAmount: '0',
        }));

        const requiredOutputs = vaultDepositZap.outputs.map(output => ({
          token: output.token.address,
          minOutputAmount: toWeiString(
            slipBy(output.amount, slippage, output.token.decimals),
            output.token.decimals
          ),
        }));

        const outputs = uniqBy(requiredOutputs.concat(dustOutputs), output => output.token);

        const zapRequest: UserlessZapRequest = {
          order: {
            inputs: depositZap.inputs.map(input => ({
              token: input.token.address,
              amount: toWeiString(input.amount, input.token.decimals),
            })),
            outputs: outputs,
            relay: NO_RELAY,
          },
          steps: [depositZap.zap].concat(vaultDepositZap.zap),
        };

        const expectedTokens = quote.outputs.map(output => output.token);

        const walletAction = zapExecuteOrder(this.vault.id, zapRequest, expectedTokens);
        return walletAction(dispatch, getState, extraArgument);
      } else {
        if (!this.isMatchingDepositQuote(underlyingQuote)) {
          throw new Error('Invalid underlying deposit quote');
        }
        // We have the built userless zap-in request
        const { zapRequest, minBalances } =
          await this.underlyingStrategy.fetchDepositUserlessZapBreakdown(underlyingQuote);

        const vaultDepositZap = await this.vaultType.fetchZapDeposit({
          inputs: [
            {
              token: this.depositToken,
              amount: minBalances.get(this.depositToken), // min expected in case add liquidity slipped
              max: true, // but we call depositAll
            },
          ],
          from: this.helpers.zap.router,
        });

        zapRequest.steps.push(vaultDepositZap.zap);
        minBalances.subtractMany(vaultDepositZap.inputs);
        minBalances.addMany(vaultDepositZap.minOutputs);

        const requiredOutputs = vaultDepositZap.outputs.map(output => ({
          token: output.token.address,
          minOutputAmount: toWeiString(
            slipBy(output.amount, slippage, output.token.decimals),
            output.token.decimals
          ),
        }));

        zapRequest.order.outputs = requiredOutputs.concat(
          zapRequest.order.outputs.map(output => ({
            token: output.token,
            minOutputAmount: '0',
          }))
        );

        const expectedTokens = vaultDepositZap.outputs.map(output => output.token);
        const walletAction = zapExecuteOrder(this.vault.id, zapRequest, expectedTokens);
        return walletAction(dispatch, getState, extraArgument);
      }
    };

    return {
      step: 'zap-in',
      message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
      action: zapAction,
      pending: false,
      extraInfo: { zap: true, vaultId: quote.option.vaultId },
    };
  }

  async fetchWithdrawOptions(): Promise<VaultComposerWithdrawOption[]> {
    const options = await this.underlyingStrategy.fetchWithdrawOptions();
    const vaultOption =
      (await this.underlyingVaultType.fetchWithdrawOption()) as CowcentratedVaultWithdrawOption;

    return [vaultOption, ...options].map(option => ({
      ...option,
      strategyId,
      inputs: option.inputs.map(input => ({
        ...input,
        token: this.shareToken,
      })),
      vaultId: this.vault.id,
      underlyingOption: option,
    }));
  }

  async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: VaultComposerWithdrawOption
  ): Promise<VaultComposerZapWithdrawQuote> {
    const { underlyingOption } = option;
    const input = onlyOneInput(inputs);
    const { zap } = this.helpers;

    const vaultComposerWithdrawQuote = await this.vaultType.fetchWithdrawQuote(
      [
        {
          token: this.depositToken,
          amount: input.amount,
          max: input.max,
        },
      ],
      option
    );

    if (underlyingOption.strategyId === 'vault') {
      const underlyingQuote = (await this.underlyingVaultType.fetchWithdrawQuote(
        [
          {
            token: this.depositToken,
            amount: vaultComposerWithdrawQuote.outputs[0].amount,
            max: input.max,
          },
        ],
        underlyingOption
      )) as CowcentratedVaultWithdrawQuote;

      const withdrawSteps: ZapQuoteStep[] = [
        {
          type: 'withdraw',
          outputs: underlyingQuote.outputs,
        },
      ];

      withdrawSteps.unshift({
        type: 'withdraw',
        outputs: underlyingQuote.inputs.map(input => ({
          token: input.token,
          amount: input.amount,
        })),
      });

      return {
        ...underlyingQuote,
        option,
        inputs,
        steps: withdrawSteps,
        vaultType: 'standard',
        strategyId: 'vault-composer',
        subStrategy: 'vault',
        fee: ZERO_FEE,
        priceImpact: calculatePriceImpact(
          inputs,
          underlyingQuote.outputs,
          underlyingQuote.returned,
          this.helpers.getState()
        ),
        allowances: [
          {
            token: this.shareToken,
            amount: input.amount,
            spenderAddress: zap.manager,
          },
        ],
        underlyingQuote,
      };
    }

    if (!this.isMatchingWithdrawOption(underlyingOption)) {
      throw new Error('Invalid underlying withdraw option');
    }

    const underlyingQuote = await this.underlyingStrategy.fetchWithdrawQuote(
      vaultComposerWithdrawQuote.outputs.map(o => ({ ...o, max: true })),
      underlyingOption
    );

    const withdrawQuoteSteps = underlyingQuote.steps.map(s => s);
    withdrawQuoteSteps.unshift({
      type: 'withdraw',
      outputs: vaultComposerWithdrawQuote.outputs,
    });

    return {
      ...underlyingQuote,
      steps: withdrawQuoteSteps,
      inputs,
      vaultType: 'standard',
      strategyId: 'vault-composer',
      subStrategy: 'strategy',
      allowances: [
        {
          amount: inputs[0].amount,
          spenderAddress: zap.manager,
          token: this.shareToken,
        },
      ],
      priceImpact: calculatePriceImpact(
        inputs,
        underlyingQuote.outputs,
        underlyingQuote.returned,
        this.helpers.getState()
      ),
      underlyingQuote,
      option,
    };
  }

  async fetchWithdrawStep(
    quote: VaultComposerZapWithdrawQuote,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const { underlyingQuote } = quote;

    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const state = this.helpers.getState();
      const slippage = selectTransactSlippage(state);

      const vaultWithdrawZap = await this.vaultType.fetchZapWithdraw({
        inputs: quote.inputs,
        from: this.helpers.zap.router,
      });

      if (quote.subStrategy === 'vault') {
        const cowWithdraw = await this.underlyingVaultType.fetchZapWithdraw({
          inputs: underlyingQuote.inputs,
          from: this.helpers.zap.router,
        });

        const steps: ZapStep[] = [];
        steps.push(vaultWithdrawZap.zap);
        steps.push(cowWithdraw.zap);

        const inputs: OrderInput[] = vaultWithdrawZap.inputs.map(input => ({
          token: input.token.address,
          amount: toWeiString(input.amount, input.token.decimals),
        }));

        const requiredOutputs: OrderOutput[] = underlyingQuote.outputs.map(output => ({
          token: output.token.address,
          minOutputAmount: toWeiString(
            slipBy(output.amount, slippage, output.token.decimals),
            output.token.decimals
          ),
        }));

        const dustOutputs: OrderOutput[] = pickTokens(
          quote.inputs,
          quote.outputs,
          quote.returned
        ).map(token => ({
          token: token.address,
          minOutputAmount: '0',
        }));

        const outputs = uniqBy(requiredOutputs.concat(dustOutputs), output => output.token);
        const expectedTokens = quote.outputs.map(output => output.token);

        const zapRequest: UserlessZapRequest = {
          order: {
            inputs,
            outputs,
            relay: NO_RELAY,
          },
          steps,
        };

        const walletAction = zapExecuteOrder(this.vault.id, zapRequest, expectedTokens);
        return walletAction(dispatch, getState, extraArgument);
      } else {
        if (!this.isMatchingWithdrawQuote(underlyingQuote)) {
          throw new Error('Invalid underlying withdraw quote');
        }
        const { zapRequest, expectedTokens } =
          await this.underlyingStrategy.fetchWithdrawUserlessZapBreakdown(underlyingQuote);
        //It's only 1 zap step, so we can just add it to the beginning, if there were more steps, we would need to add them in order too
        zapRequest.steps.unshift(vaultWithdrawZap.zap);

        zapRequest.order.inputs = vaultWithdrawZap.inputs.map(input => ({
          token: input.token.address,
          amount: toWeiString(input.amount, input.token.decimals),
        }));

        zapRequest.order.outputs.push({
          token: this.shareToken.address,
          minOutputAmount: '0',
        });

        const walletAction = zapExecuteOrder(this.vault.id, zapRequest, expectedTokens);
        return walletAction(dispatch, getState, extraArgument);
      }
    };

    return {
      step: 'zap-out',
      message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
      action: zapAction,
      pending: false,
      extraInfo: { zap: true, vaultId: quote.option.vaultId },
    };
  }

  protected isMatchingWithdrawOption(
    option: WithdrawOption
  ): option is ZapStrategyIdToWithdrawOption<typeof this.underlyingStrategy.id> {
    return option.strategyId === this.underlyingStrategy.id;
  }

  protected isMatchingWithdrawQuote(
    option: WithdrawQuote
  ): option is ZapStrategyIdToWithdrawQuote<typeof this.underlyingStrategy.id> {
    return option.strategyId === this.underlyingStrategy.id;
  }
}

export const VaultComposerStrategy =
  VaultComposerStrategyImpl satisfies IComposerStrategyStatic<StrategyId>;
