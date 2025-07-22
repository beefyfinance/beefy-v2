import type { Abi } from 'viem';
import type BigNumber from 'bignumber.js';
import { uniqBy } from 'lodash-es';
import type { Namespace, TFunction } from 'react-i18next';
import { encodeFunctionData } from 'viem';
import { bigNumberToBigInt, toWei, toWeiString } from '../../../../../../helpers/big-number.ts';
import { zapExecuteOrder } from '../../../../actions/wallet/zap.ts';
import type { ChainEntity } from '../../../../entities/chain.ts';
import { isTokenEqual, type TokenEntity, type TokenErc20 } from '../../../../entities/token.ts';
import { isMultiGovVault, type VaultGov } from '../../../../entities/vault.ts';
import type { Step } from '../../../../reducers/wallet/stepper-types.ts';
import { selectChainById } from '../../../../selectors/chains.ts';
import { selectErc20TokenByAddress, selectTokenByAddress } from '../../../../selectors/tokens.ts';
import { selectTransactSlippage } from '../../../../selectors/transact.ts';
import type { BeefyState, BeefyThunk } from '../../../../store/types.ts';
import { slipBy } from '../../helpers/amounts.ts';
import { onlyOneInput } from '../../helpers/options.ts';
import { calculatePriceImpact, ZERO_FEE } from '../../helpers/quotes.ts';
import { pickTokens } from '../../helpers/tokens.ts';
import { getInsertIndex, NO_RELAY } from '../../helpers/zap.ts';
import {
  type CowcentratedVaultDepositOption,
  type CowcentratedVaultDepositQuote,
  type CowcentratedVaultWithdrawOption,
  type CowcentratedVaultWithdrawQuote,
  type DepositOption,
  type DepositQuote,
  type GovComposerDepositOption,
  type GovComposerWithdrawOption,
  type GovComposerZapDepositQuote,
  type GovComposerZapWithdrawQuote,
  type InputTokenAmount,
  isZapQuoteStepStake,
  isZapQuoteStepUnstake,
  type TokenAmount,
  type WithdrawOption,
  type WithdrawQuote,
  type ZapQuoteStep,
  type ZapQuoteStepStake,
  type ZapQuoteStepUnstake,
  type ZapStrategyIdToDepositOption,
  type ZapStrategyIdToDepositQuote,
  type ZapStrategyIdToWithdrawOption,
  type ZapStrategyIdToWithdrawQuote,
} from '../../transact-types.ts';
import {
  type ICowcentratedVaultType,
  type IGovVaultType,
  isCowcentratedVaultType,
  isGovVaultType,
} from '../../vaults/IVaultType.ts';
import type {
  OrderInput,
  OrderOutput,
  UserlessZapRequest,
  ZapStep,
  ZapStepRequest,
  ZapStepResponse,
} from '../../zap/types.ts';
import {
  type AnyComposableStrategy,
  type IComposableStrategy,
  type IComposerStrategy,
  type IComposerStrategyStatic,
  type ZapTransactHelpers,
} from '../IStrategy.ts';
import type { GovComposerStrategyConfig } from '../strategy-configs.ts';

type ZapHelpers = {
  chain: ChainEntity;
  slippage: number;
  state: BeefyState;
};

const strategyId = 'gov-composer';
type StrategyId = typeof strategyId;

class GovComposerStrategyImpl implements IComposerStrategy<StrategyId> {
  public static readonly id = strategyId;
  public static readonly composer = true;
  public readonly id = strategyId;
  public readonly disableVaultWithdraw = true;

  protected readonly vault: VaultGov;
  protected readonly vaultType: IGovVaultType;
  protected readonly underlyingStrategy: IComposableStrategy<'cowcentrated'>;
  protected readonly underlyingVaultType: ICowcentratedVaultType;
  protected readonly shareToken: TokenErc20;
  protected readonly depositToken: TokenEntity;

  constructor(
    protected options: GovComposerStrategyConfig,
    protected helpers: ZapTransactHelpers,
    underlying: AnyComposableStrategy
  ) {
    const { vault, vaultType, getState } = this.helpers;
    if (!isMultiGovVault(vault)) {
      throw new Error('Vault is not a multi gov vault');
    }
    if (!isGovVaultType(vaultType)) {
      throw new Error('Vault type is not gov');
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

  async fetchDepositOptions(): Promise<GovComposerDepositOption[]> {
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

  // FIXME this will break if this strategy supports multiple underlying strategies
  protected isMatchingDepositOption(
    option: DepositOption
  ): option is ZapStrategyIdToDepositOption<typeof this.underlyingStrategy.id> {
    return option.strategyId === this.underlyingStrategy.id;
  }

  async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: GovComposerDepositOption
  ): Promise<GovComposerZapDepositQuote> {
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
          type: 'stake',
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
        strategyId: 'gov-composer',
        vaultType: 'gov',
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
        type: 'stake',
        inputs: underlyingQuote.outputs,
      }),
      priceImpact: calculatePriceImpact(
        underlyingQuote.inputs,
        underlyingQuote.outputs,
        underlyingQuote.returned,
        this.helpers.getState()
      ),
      vaultType: 'gov',
      strategyId: 'gov-composer',
      subStrategy: 'strategy',
      underlyingQuote,
      option,
    };
  }

  // FIXME this will break if this strategy supports multiple underlying strategies
  protected isMatchingDepositQuote(
    option: DepositQuote
  ): option is ZapStrategyIdToDepositQuote<typeof this.underlyingStrategy.id> {
    return option.strategyId === this.underlyingStrategy.id;
  }

  async fetchDepositStep(
    quote: GovComposerZapDepositQuote,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const { underlyingQuote } = quote;

    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const state = this.helpers.getState();
      const chain = selectChainById(state, this.vault.chainId);
      const slippage = selectTransactSlippage(state);
      const zapHelpers: ZapHelpers = { chain, slippage, state };

      const stakeStep = quote.steps.find(isZapQuoteStepStake);

      if (!stakeStep) {
        throw new Error('Invalid quote: no stake step found');
      }

      if (quote.underlyingQuote.strategyId === 'vault') {
        const depositZap = await this.underlyingVaultType.fetchZapDeposit({
          inputs: underlyingQuote.inputs,
          from: this.helpers.zap.router,
        });

        const stakeZap = await this.fetchZapStakeStep(
          stakeStep,
          [
            {
              token: this.depositToken,
              amount: underlyingQuote.outputs[0].amount,
            },
          ],
          zapHelpers
        );

        const dustOutputs: OrderOutput[] = pickTokens(
          quote.outputs,
          quote.inputs,
          quote.returned
        ).map(token => ({
          token: token.address,
          minOutputAmount: '0',
        }));

        const requiredOutputs = stakeZap.outputs.map(output => ({
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
          steps: [depositZap.zap].concat(stakeZap.zaps),
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

        // Stake
        const stakeZap = await this.fetchZapStakeStep(
          stakeStep,
          [
            {
              token: this.depositToken,
              amount: minBalances.get(this.depositToken),
            },
          ],
          zapHelpers
        );

        stakeZap.zaps.forEach(zap => zapRequest.steps.push(zap));
        minBalances.subtractMany(stakeZap.inputs);
        minBalances.addMany(stakeZap.minOutputs);

        const requiredOutputs = stakeZap.outputs.map(output => ({
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

        const expectedTokens = stakeZap.outputs.map(output => output.token);
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

  protected async fetchZapStakeStep(
    _quoteStep: ZapQuoteStepStake,
    minInputs: TokenAmount[],
    zapHelpers: ZapHelpers
  ): Promise<ZapStepResponse> {
    const { zap } = this.helpers;
    const { slippage } = zapHelpers;

    return await this.getZapStake({
      inputs: minInputs,
      outputs: [
        {
          token: this.shareToken,
          amount: minInputs[0].amount,
        },
      ],
      maxSlippage: slippage,
      zapRouter: zap.router,
      insertBalance: true,
    });
  }

  protected async getZapStake(request: ZapStepRequest): Promise<ZapStepResponse> {
    const { inputs, outputs } = request;
    if (inputs.length !== 1) throw new Error('Invalid inputs');
    if (!isTokenEqual(inputs[0].token, this.depositToken)) throw new Error('Invalid token');

    return {
      inputs,
      outputs,
      minOutputs: outputs,
      returned: [],
      zaps: [
        this.buildZapStakeTx(
          this.vault.contractAddress,
          toWei(inputs[0].amount, inputs[0].token.decimals),
          inputs[0].token.address
        ),
      ],
    };
  }

  protected buildZapStakeTx(
    govVaultAddress: string,
    amount: BigNumber,
    depositTokenAddress: string
  ): ZapStep {
    return {
      target: govVaultAddress,
      value: '0',
      data: encodeFunctionData({
        abi: [
          {
            type: 'function',
            name: 'stake',
            constant: false,
            payable: false,
            inputs: [
              {
                name: '_amount0',
                type: 'uint256',
              },
            ],
            stateMutability: 'nonpayable',
            outputs: [],
          },
        ] as const satisfies Abi,
        args: [bigNumberToBigInt(amount)],
      }),
      tokens: [
        {
          token: depositTokenAddress,
          index: getInsertIndex(0),
        },
      ],
    };
  }

  async fetchWithdrawOptions(): Promise<GovComposerWithdrawOption[]> {
    const options = await this.underlyingStrategy.fetchWithdrawOptions();
    const vaultOption =
      (await this.underlyingVaultType.fetchWithdrawOption()) as CowcentratedVaultWithdrawOption;

    return [vaultOption, ...options].map(option => ({
      ...option,
      strategyId,
      vaultId: this.vault.id,
      underlyingOption: option,
    }));
  }

  async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: GovComposerWithdrawOption
  ): Promise<GovComposerZapWithdrawQuote> {
    const { underlyingOption } = option;
    const input = onlyOneInput(inputs);
    const { zap } = this.helpers;

    if (underlyingOption.strategyId === 'vault') {
      const underlyingQuote = (await this.underlyingVaultType.fetchWithdrawQuote(
        [
          {
            token: this.depositToken,
            amount: input.amount,
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
        type: 'unstake',
        outputs: underlyingQuote.inputs.map(input => ({
          token: input.token,
          amount: input.amount,
        })),
      });

      const modInputs = underlyingQuote.inputs.map(input => ({
        ...input,
        token: this.shareToken,
      }));

      return {
        ...underlyingQuote,
        option,
        inputs: modInputs,
        steps: withdrawSteps,
        vaultType: 'gov',
        strategyId: 'gov-composer',
        subStrategy: 'vault',
        fee: ZERO_FEE,
        priceImpact: calculatePriceImpact(
          modInputs,
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

    // Quote to be fetched via underlying strategy
    const underlyingQuote = await this.underlyingStrategy.fetchWithdrawQuote(
      inputs,
      underlyingOption
    );

    const unstakeSteps = underlyingQuote.steps.map(s => s);
    unstakeSteps.unshift({
      type: 'unstake',
      outputs: underlyingQuote.inputs.map(input => ({
        token: input.token,
        amount: input.amount,
      })),
    });

    const modInputs = [
      {
        token: this.shareToken,
        amount: underlyingQuote.inputs[0].amount,
        max: underlyingQuote.inputs[0].max,
      },
    ];

    return {
      ...underlyingQuote,
      steps: unstakeSteps,
      inputs: modInputs,
      vaultType: 'gov',
      strategyId: 'gov-composer',
      subStrategy: 'strategy',
      allowances: underlyingQuote.allowances.map(allowance => ({
        ...allowance,
        token: this.shareToken,
      })),
      priceImpact: calculatePriceImpact(
        modInputs,
        underlyingQuote.outputs,
        underlyingQuote.returned,
        this.helpers.getState()
      ),
      underlyingQuote,
      option,
    };
  }

  async fetchWithdrawStep(
    quote: GovComposerZapWithdrawQuote,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const { underlyingQuote } = quote;

    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const state = this.helpers.getState();
      const chain = selectChainById(state, this.vault.chainId);
      const slippage = selectTransactSlippage(state);
      const zapHelpers: ZapHelpers = { chain, slippage, state };
      const unstakeStep = quote.steps.find(isZapQuoteStepUnstake);

      if (!unstakeStep) {
        throw new Error('Invalid quote: no unstake step found');
      }

      // Unstake
      const unstakeZap = await this.fetchZapUnstakeStep(
        unstakeStep,
        zapHelpers,
        underlyingQuote.inputs[0].max
      );

      if (quote.subStrategy === 'vault') {
        const vaultWithdraw = await this.underlyingVaultType.fetchZapWithdraw({
          inputs: underlyingQuote.inputs,
          from: this.helpers.zap.router,
        });

        const steps: ZapStep[] = [];
        steps.push(...unstakeZap.zaps);
        steps.push(vaultWithdraw.zap);

        const inputs: OrderInput[] = unstakeZap.inputs.map(input => ({
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
        unstakeZap.zaps.forEach(zap => zapRequest.steps.unshift(zap));

        zapRequest.order.inputs = unstakeZap.inputs.map(input => ({
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

  async fetchZapUnstakeStep(
    quoteStep: ZapQuoteStepUnstake,
    zapHelpers: ZapHelpers,
    max: boolean
  ): Promise<ZapStepResponse> {
    const { zap } = this.helpers;
    const { slippage } = zapHelpers;
    return this.getZapUnstake(
      {
        inputs: [
          {
            token: this.shareToken,
            amount: quoteStep.outputs[0].amount,
          },
        ],
        outputs: quoteStep.outputs,
        maxSlippage: slippage,
        zapRouter: zap.router,
        insertBalance: true,
      },
      max
    );
  }

  protected async getZapUnstake(request: ZapStepRequest, max: boolean): Promise<ZapStepResponse> {
    const { inputs, outputs } = request;
    if (outputs.length !== 1) throw new Error('Invalid outputs');
    if (inputs.length !== 1) throw new Error('Invalid inputs');
    if (!isTokenEqual(inputs[0].token, this.shareToken)) throw new Error('Invalid input token');
    if (!isTokenEqual(outputs[0].token, this.depositToken)) throw new Error('Invalid output token');

    return {
      inputs,
      outputs,
      minOutputs: outputs,
      returned: [],
      zaps: [
        this.buildZapUnstakeTx(
          this.vault.contractAddress,
          toWei(inputs[0].amount, inputs[0].token.decimals),
          max
        ),
      ],
    };
  }

  protected buildZapUnstakeTx(govVaultAddress: string, amount: BigNumber, max: boolean): ZapStep {
    if (max) console.log();
    // TODO Add support for exit when max => we should also be adding every reward token to the list to be returned
    return {
      target: govVaultAddress,
      value: '0',
      data: encodeFunctionData({
        abi: [
          {
            type: 'function',
            name: 'withdraw',
            constant: false,
            payable: false,
            inputs: [
              {
                name: '_amount0',
                type: 'uint256',
              },
            ],
            stateMutability: 'nonpayable',
            outputs: [],
          },
        ] as const satisfies Abi,
        args: [bigNumberToBigInt(amount)],
      }),
      tokens: [
        {
          token: govVaultAddress,
          index: getInsertIndex(0),
        },
      ],
    };
  }

  // FIXME this will break if this strategy supports multiple underlying strategies
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

export const GovComposerStrategy =
  GovComposerStrategyImpl satisfies IComposerStrategyStatic<StrategyId>;
