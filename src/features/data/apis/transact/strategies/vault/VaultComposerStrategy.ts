import type { TFunction, Namespace } from 'react-i18next';
import type { BeefyState, BeefyThunk } from '../../../../../../redux-types';
import type { ChainEntity } from '../../../../entities/chain';
import type { Step } from '../../../../reducers/wallet/stepper';
import type {
  InputTokenAmount,
  CowcentratedVaultDepositOption,
  CowcentratedVaultDepositQuote,
  ZapQuoteStep,
  DepositQuote,
  ZapStrategyIdToDepositQuote,
  DepositOption,
  ZapStrategyIdToDepositOption,
  VaultComposerDepositOption,
  VaultComposerZapDepositQuote,
  CowcentratedVaultWithdrawOption,
  VaultComposerWithdrawOption,
  VaultComposerZapWithdrawQuote,
} from '../../transact-types';
import type {
  AnyComposableStrategy,
  IComposableStrategy,
  IComposerStrategy,
  IComposerStrategyStatic,
  ZapTransactHelpers,
} from '../IStrategy';
import type { VaultComposerStrategyConfig } from '../strategy-configs';
import {
  isCowcentratedStandardVault,
  type VaultStandardCowcentrated,
} from '../../../../entities/vault';
import {
  isCowcentratedVaultType,
  type ICowcentratedVaultType,
  type IStandardVaultType,
  isStandardVaultType,
} from '../../vaults/IVaultType';
import type { TokenEntity, TokenErc20 } from '../../../../entities/token';
import { selectErc20TokenByAddress, selectTokenByAddress } from '../../../../selectors/tokens';
import { ZERO_FEE, calculatePriceImpact } from '../../helpers/quotes';
import { selectChainById } from '../../../../selectors/chains';
import { selectTransactSlippage } from '../../../../selectors/transact';
import type { OrderOutput, UserlessZapRequest } from '../../zap/types';
import { pickTokens } from '../../helpers/tokens';
import { toWeiString } from '../../../../../../helpers/big-number';
import { slipBy } from '../../helpers/amounts';
import { uniqBy } from 'lodash-es';
import { walletActions } from '../../../../actions/wallet-actions';
import { NO_RELAY } from '../../helpers/zap';

type ZapHelpers = {
  chain: ChainEntity;
  slippage: number;
  state: BeefyState;
};

const strategyId = 'vault-composer' as const;
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

    const modOutputs = underlyingQuote.outputs.map(output => ({
      token: this.shareToken,
      amount: output.amount,
    }));

    return {
      ...underlyingQuote,
      outputs: modOutputs,
      steps: underlyingQuote.steps.concat({
        type: 'deposit',
        inputs: underlyingQuote.outputs,
      }),
      priceImpact: calculatePriceImpact(
        underlyingQuote.inputs,
        modOutputs,
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
    t: TFunction<Namespace, undefined>
  ): Promise<Step> {
    const { underlyingQuote } = quote;

    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const state = this.helpers.getState();
      const chain = selectChainById(state, this.vault.chainId);
      const slippage = selectTransactSlippage(state);
      const zapHelpers: ZapHelpers = { chain, slippage, state };

      if (quote.underlyingQuote.strategyId === 'vault') {
        const depositZap = await this.underlyingVaultType.fetchZapDeposit({
          inputs: underlyingQuote.inputs,
        });

        const vaultDepositZap = await this.vaultType.fetchZapDeposit({
          inputs: [
            {
              token: this.depositToken,
              amount: underlyingQuote.outputs[0].amount, // min expected in case add liquidity slipped
              max: true, // but we call depositAll
            },
          ],
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

        const walletAction = walletActions.zapExecuteOrder(
          this.vault.id,
          zapRequest,
          expectedTokens
        );
        return walletAction(dispatch, getState, extraArgument);
      } else {
        throw new Error('not implemented');
        //   if (!this.isMatchingDepositQuote(underlyingQuote)) {
        //     throw new Error('Invalid underlying deposit quote');
        //   }
        //   // We have the built userless zap-in request
        //   const { zapRequest, expectedTokens, minBalances } =
        //     await this.underlyingStrategy.fetchDepositUserlessZapBreakdown(underlyingQuote);

        //   // Stake
        //   const stakeZap = await this.fetchZapStakeStep(
        //     stakeStep,
        //     [
        //       {
        //         token: this.depositToken,
        //         amount: minBalances.get(this.depositToken),
        //       },
        //     ],
        //     zapHelpers
        //   );

        //   stakeZap.zaps.forEach(zap => zapRequest.steps.push(zap));
        //   minBalances.subtractMany(stakeZap.inputs);
        //   minBalances.addMany(stakeZap.minOutputs);

        //   const requiredOutputs = stakeZap.outputs.map(output => ({
        //     token: output.token.address,
        //     minOutputAmount: toWeiString(
        //       slipBy(output.amount, slippage, output.token.decimals),
        //       output.token.decimals
        //     ),
        //   }));

        //   zapRequest.order.outputs = requiredOutputs.concat(
        //     zapRequest.order.outputs.map(output => ({
        //       token: output.token,
        //       minOutputAmount: '0',
        //     }))
        //   );

        //   const walletAction = walletActions.zapExecuteOrder(
        //     this.vault.id,
        //     zapRequest,
        //     expectedTokens
        //   );
        //   return walletAction(dispatch, getState, extraArgument);
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
      vaultId: this.vault.id,
      underlyingOption: option,
    }));
  }

  async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: VaultComposerWithdrawOption
  ): Promise<VaultComposerZapWithdrawQuote> {
    throw new Error('Method not implemented.');
  }

  fetchWithdrawStep(
    quote: VaultComposerZapWithdrawQuote,
    t: TFunction<Namespace, undefined>
  ): Promise<Step> {
    throw new Error('Method not implemented.');
  }
}

export const VaultComposerStrategy =
  VaultComposerStrategyImpl satisfies IComposerStrategyStatic<StrategyId>;
