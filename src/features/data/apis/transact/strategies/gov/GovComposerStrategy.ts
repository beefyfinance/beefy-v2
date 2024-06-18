import type { Namespace, TFunction } from 'react-i18next';
import type { Step } from '../../../../reducers/wallet/stepper';
import {
  type DepositOption,
  type DepositQuote,
  type GovComposerDepositOption,
  type GovComposerWithdrawOption,
  type GovComposerZapDepositQuote,
  type GovComposerZapWithdrawQuote,
  type InputTokenAmount,
  isZapQuoteStepStake,
  type TokenAmount,
  type TransactQuote,
  type ZapQuoteStepStake,
  type ZapStrategyIdToDepositOption,
  type ZapStrategyIdToDepositQuote,
} from '../../transact-types';
import {
  type AnyComposableStrategy,
  type IComposableStrategy,
  type IComposerStrategy,
  type IComposerStrategyStatic,
  type ZapTransactHelpers,
} from '../IStrategy';
import { isMultiGovVault, type VaultGov } from '../../../../entities/vault';
import {
  type ICowcentratedVaultType,
  type IGovVaultType,
  isCowcentratedVaultType,
  isGovVaultType,
} from '../../vaults/IVaultType';
import { isTokenEqual, type TokenEntity } from '../../../../entities/token';
import { selectTokenByAddress } from '../../../../selectors/tokens';
import type { BeefyState, BeefyThunk } from '../../../../../../redux-types';
import { walletActions } from '../../../../actions/wallet-actions';
import { selectChainById } from '../../../../selectors/chains';
import { selectTransactSlippage } from '../../../../selectors/transact';
import type { ChainEntity } from '../../../../entities/chain';
import type { ZapStep, ZapStepRequest, ZapStepResponse } from '../../zap/types';
import type BigNumber from 'bignumber.js';
import abiCoder from 'web3-eth-abi';
import { getInsertIndex } from '../../helpers/zap';
import { toWei, toWeiString } from '../../../../../../helpers/big-number';
import { slipBy } from '../../helpers/amounts';
import type { GovComposerStrategyConfig } from '../strategy-configs';

type ZapHelpers = {
  chain: ChainEntity;
  slippage: number;
  state: BeefyState;
};

const strategyId = 'gov-composer' as const;
type StrategyId = typeof strategyId;

class GovComposerStrategyImpl implements IComposerStrategy<StrategyId> {
  public static readonly id = strategyId;
  public static readonly composer = true;
  public readonly id = strategyId;

  protected readonly vault: VaultGov;
  protected readonly vaultType: IGovVaultType;
  protected readonly underlyingStrategy: IComposableStrategy<'cowcentrated'>;
  protected readonly underlyingVaultType: ICowcentratedVaultType;
  protected readonly shareToken: TokenEntity;
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
    this.shareToken = selectTokenByAddress(getState(), vault.chainId, vault.earnContractAddress);
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
    // TODO: offer 2 token option vault zap-in, should be extracted from underlyingVaultType
    // We need to map those options to the current vault zaps
    return (
      options
        // .filter(o => o.strategyId !== 'vault')
        .map(option => ({
          ...option,
          strategyId,
          vaultId: this.vault.id,
          underlyingOption: option,
        }))
    );
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
    if (!this.isMatchingDepositOption(underlyingOption)) {
      throw new Error('Invalid underlying deposit option');
    }

    // Quote to be fetched via underlying strategy
    const underlyingQuote = await this.underlyingStrategy.fetchDepositQuote(
      inputs,
      underlyingOption
    );

    return {
      ...underlyingQuote,
      outputs: underlyingQuote.outputs.map(output => ({
        token: this.shareToken,
        amount: output.amount,
      })),
      steps: underlyingQuote.steps.concat({
        type: 'stake',
        inputs: underlyingQuote.outputs,
      }),
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
    // if (quote.subStrategy === 'vault') throw new Error('2 token Zap-in not enabled yet');
    const { underlyingQuote } = quote;

    if (!this.isMatchingDepositQuote(underlyingQuote)) {
      throw new Error('Invalid underlying deposit quote');
    }

    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      // We have the built userless zap-in request
      const { zapRequest, expectedTokens, minBalances } =
        await this.underlyingStrategy.fetchDepositUserlessZapBreakdown(underlyingQuote);

      const state = this.helpers.getState();
      const chain = selectChainById(state, this.vault.chainId);
      const slippage = selectTransactSlippage(state);
      const zapHelpers: ZapHelpers = { chain, slippage, state };

      const stakeStep = quote.steps.find(isZapQuoteStepStake);

      if (!stakeStep) {
        throw new Error('Invalid quote: no stake quote found');
      }

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

      const walletAction = walletActions.zapExecuteOrder(this.vault.id, zapRequest, expectedTokens);
      return walletAction(dispatch, getState, extraArgument);
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
    quoteStep: ZapQuoteStepStake,
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
          this.vault.earnContractAddress,
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
      data: abiCoder.encodeFunctionCall(
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
          outputs: [],
        },
        [amount.toString(10)]
      ),
      tokens: [
        {
          token: depositTokenAddress,
          index: getInsertIndex(0),
        },
      ],
    };
  }

  async fetchWithdrawOptions(): Promise<GovComposerWithdrawOption[]> {
    throw new Error('Method not implemented.');
  }

  fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: GovComposerWithdrawOption
  ): Promise<GovComposerZapWithdrawQuote> {
    if (!inputs || !option) console.log();
    throw new Error('Method not implemented.');
  }

  fetchWithdrawStep(quote: TransactQuote, t: TFunction<Namespace, undefined>): Promise<Step> {
    if (!quote || !t) console.log();
    throw new Error('Method not implemented.');
  }
}

export const GovComposerStrategy =
  GovComposerStrategyImpl satisfies IComposerStrategyStatic<StrategyId>;
