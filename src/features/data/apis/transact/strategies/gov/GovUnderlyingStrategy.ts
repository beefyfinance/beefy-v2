import type { TFunction, Namespace } from 'react-i18next';
import type { Step } from '../../../../reducers/wallet/stepper';
import {
  type InputTokenAmount,
  type TransactQuote,
  type WithdrawOption,
  type WithdrawQuote,
  type GovUnderlyingDepositOption,
  type ZapDepositQuote,
  type GovUnderlyingZapDepositQuote,
  type CowcentratedZapDepositQuote,
  type ZapQuoteStepStake,
  type TokenAmount,
  isZapQuoteStepStake,
} from '../../transact-types';
import type {
  GovVaultStrategyOptions,
  IComposableStrategy,
  IStrategy,
  ZapTransactHelpers,
} from '../IStrategy';
import { isGovVault, type VaultGov } from '../../../../entities/vault';
import {
  isGovVaultType,
  type IGovVaultType,
  type ICowcentratedVaultType,
} from '../../vaults/IVaultType';
import { selectCowcentratedVaultById } from '../../../../selectors/vaults';
import { strategyBuildersById } from '..';
import { getVaultTypeBuilder } from '../../vaults';
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

type ZapHelpers = {
  chain: ChainEntity;
  slippage: number;
  state: BeefyState;
};

export class GovUnderlyingStrategy<TOptions extends GovVaultStrategyOptions> implements IStrategy {
  public readonly id = 'gov';
  protected readonly vault: VaultGov;
  protected readonly vaultType: IGovVaultType;
  protected underlyingVaultType: ICowcentratedVaultType | undefined;
  protected underlyingStrategy: IComposableStrategy | undefined;
  protected linked: boolean = false;
  protected readonly shareToken: TokenEntity;
  protected readonly depositToken: TokenEntity;

  constructor(protected options: TOptions, protected helpers: ZapTransactHelpers) {
    const { vault, vaultType, getState } = this.helpers;
    if (!isGovVault(vault)) {
      throw new Error('Vault is not a cowcentrated vault');
    }
    if (!isGovVaultType(vaultType)) {
      throw new Error('Vault type is not cowcentrated');
    }
    this.vault = vault;
    this.vaultType = vaultType;
    this.shareToken = selectTokenByAddress(getState(), vault.chainId, vault.earnContractAddress);
    this.depositToken = selectTokenByAddress(getState(), vault.chainId, vault.depositTokenAddress);
  }

  async linkUnderlying() {
    const { getState, swapAggregator, zap } = this.helpers;
    const state = getState();
    const underlyingCLM = selectCowcentratedVaultById(state, 'uniswap-cow-arb-eusd-usdc');
    const underlyingVaultType = await getVaultTypeBuilder(underlyingCLM)(underlyingCLM, getState);
    //only
    const zapOption = underlyingCLM.zaps.filter(zap => zap.strategyId === 'cowcentrated');
    if (zapOption.length > 0) {
      const helpers: ZapTransactHelpers = {
        vault: underlyingCLM,
        vaultType: underlyingVaultType,
        getState: getState,
        swapAggregator: swapAggregator,
        zap: zap,
      };
      this.underlyingVaultType = underlyingVaultType;
      this.underlyingStrategy = (await strategyBuildersById[zapOption[0].strategyId](
        zapOption[0],
        helpers
      )) as IComposableStrategy;
    }
    this.linked = true;
  }

  async fetchDepositOptions(): Promise<GovUnderlyingDepositOption[]> {
    if (!this.linked) await this.linkUnderlying();
    if (!this.underlyingStrategy) return [];

    const options = await this.underlyingStrategy.fetchDepositOptions();
    // TODO: offer 2 token option vault zap-in, should be extracted from underlyingVaultType
    // We need to map those options to the current vault zaps
    return options
      .filter(o => o.strategyId !== 'vault')
      .map(option => ({
        ...option,
        strategyId: 'gov',
        vaultId: this.vault.id,
        underlyingDepositOption: option,
      }));
  }

  async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: GovUnderlyingDepositOption
  ): Promise<GovUnderlyingZapDepositQuote> {
    if (!this.linked) await this.linkUnderlying();
    if (!this.underlyingStrategy || !this.underlyingVaultType)
      throw new Error('Underlying product not linked');

    if (option.underlyingDepositOption.strategyId === 'vault') {
      // Zap in with 2 tokens
      throw new Error('Underlying vault support not enabled yet');
    } else {
      // Quote to be fetched via underlying strategy
      const baseQuote = (await this.underlyingStrategy.fetchDepositQuote(
        inputs,
        option.underlyingDepositOption
      )) as ZapDepositQuote;

      const stakeQuote: GovUnderlyingZapDepositQuote = {
        ...baseQuote,
        outputs: baseQuote.outputs.map(output => ({
          token: this.shareToken,
          amount: output.amount,
        })),
        steps: baseQuote.steps.concat({
          type: 'stake',
          inputs: baseQuote.outputs,
        }),
        vaultType: 'gov',
        strategyId: 'gov',
        subStrategy: 'strategy',
        underlyingQuote: baseQuote as CowcentratedZapDepositQuote,
        option,
      };
      return stakeQuote;
    }
  }

  async fetchDepositStep(
    quote: GovUnderlyingZapDepositQuote,
    t: TFunction<Namespace>
  ): Promise<Step> {
    if (!this.linked) await this.linkUnderlying();
    if (!this.underlyingStrategy) throw new Error('Underlying product not linked');
    if (quote.subStrategy === 'vault') throw new Error('2 token Zap-in not enabled yet');

    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      // We have the built userless zap-in request
      const { zapRequest, expectedTokens, minBalances } =
        await this.underlyingStrategy!.fetchUserlessZapBreakdown(quote.underlyingQuote);

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

  async fetchWithdrawOptions(): Promise<WithdrawOption[]> {
    if (!this.linked) await this.linkUnderlying();
    throw new Error('Method not implemented.');
  }
  fetchWithdrawQuote(inputs: InputTokenAmount[], option: WithdrawOption): Promise<WithdrawQuote> {
    if (!inputs || !option) console.log();
    throw new Error('Method not implemented.');
  }
  fetchWithdrawStep(quote: TransactQuote, t: TFunction<Namespace, undefined>): Promise<Step> {
    if (!quote || !t) console.log();
    throw new Error('Method not implemented.');
  }
}
