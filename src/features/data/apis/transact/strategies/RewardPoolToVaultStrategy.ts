import type { TFunction, Namespace } from 'react-i18next';
import { isTokenEqual, type TokenErc20 } from '../../../entities/token';
import {
  isCowcentratedGovVault,
  isCowcentratedStandardVault,
  isCowcentratedVault,
  isGovVault,
  isGovVaultCowcentrated,
  type VaultEntity,
  type VaultGovCowcentrated,
  type VaultStandardCowcentrated,
} from '../../../entities/vault';
import type { Step } from '../../../reducers/wallet/stepper';
import {
  selectGovVaultById,
  selectVaultByAddress,
  selectVaultById,
} from '../../../selectors/vaults';
import {
  isZapQuoteStepUnstake,
  type InputTokenAmount,
  type RewardPoolToVaultDepositOption,
  type RewardPoolToVaultDepositQuote,
  type RewardPoolToVaultWithdrawOption,
  type ZapQuoteStep,
  isZapQuoteStepDeposit,
  type ZapQuoteStepUnstake,
  isZapQuoteStepWithdraw,
  isZapQuoteStepStake,
  type TokenAmount,
} from '../transact-types';
import {
  isStandardVaultType,
  type IGovVaultType,
  type IStandardVaultType,
  isGovVaultType,
} from '../vaults/IVaultType';
import type { IZapStrategy, ZapTransactHelpers } from './IStrategy';
import type { RewardPoolToVaultStrategyConfig } from './strategy-configs';
import { getVaultTypeBuilder } from '../vaults';
import { createOptionId, createQuoteId, createSelectionId, onlyOneInput } from '../helpers/options';
import { selectErc20TokenByAddress } from '../../../selectors/tokens';
import { TransactMode } from '../../../reducers/wallet/transact-types';
import { BIG_ZERO, toWei, toWeiString } from '../../../../../helpers/big-number';
import { selectChainById } from '../../../selectors/chains';
import { ZERO_FEE } from '../helpers/quotes';
import type { BeefyState, BeefyThunk } from '../../../../../redux-types';
import { walletActions } from '../../../actions/wallet-actions';
import type { ChainEntity } from '../../../entities/chain';
import { NO_RELAY, getInsertIndex } from '../helpers/zap';
import abiCoder from 'web3-eth-abi';
import type {
  OrderOutput,
  UserlessZapRequest,
  ZapStep,
  ZapStepRequest,
  ZapStepResponse,
} from '../zap/types';
import type BigNumber from 'bignumber.js';
import { selectTransactSlippage } from '../../../selectors/transact';
import { uniqBy } from 'lodash-es';
import { slipBy } from '../helpers/amounts';

type ZapHelpers = {
  chain: ChainEntity;
  slippage: number;
  state: BeefyState;
};

const strategyId = 'reward-pool-to-vault' as const;
type StrategyId = typeof strategyId;

export class RewardPoolToVaultStrategy implements IZapStrategy<StrategyId> {
  public static readonly id = strategyId;
  public readonly id = strategyId;

  protected readonly mainVault: VaultEntity;
  protected readonly vault: VaultStandardCowcentrated;
  protected vaultType: IStandardVaultType;
  protected readonly vaultShareToken: TokenErc20;

  //shared by both the vault and the reward pool
  protected readonly depositToken: TokenErc20; //////

  protected readonly rewardPool: VaultGovCowcentrated;
  protected rewardPoolType: IGovVaultType;
  protected readonly rewardPoolShareToken: TokenErc20;

  constructor(
    protected options: RewardPoolToVaultStrategyConfig,
    protected helpers: ZapTransactHelpers
  ) {
    const { vault, vaultType, getState } = helpers;
    this.mainVault = vault;
    if (
      !isCowcentratedStandardVault(vault) &&
      (!isGovVault(this.mainVault) || !isGovVaultCowcentrated(this.mainVault))
    ) {
      throw new Error('Vault is not a standard cowcentrated vault or a cow reward pool');
    }

    this.depositToken = selectErc20TokenByAddress(
      getState(),
      vault.chainId,
      vault.depositTokenAddress
    );
    const underlyingVault = selectVaultByAddress(
      getState(),
      vault.chainId,
      vault.depositTokenAddress
    );
    if (!underlyingVault) {
      throw new Error('Underlying cow vault not found');
    }
    if (!isCowcentratedVault(underlyingVault)) {
      throw new Error('Underlying vault is not a cowcentrated vault');
    }

    if (isCowcentratedStandardVault(vault)) {
      if (!isStandardVaultType(vaultType)) {
        throw new Error('Vault type is not a standard vault type');
      }
      this.vault = vault;
      this.vaultType = vaultType;
      this.vaultShareToken = selectErc20TokenByAddress(
        getState(),
        vault.chainId,
        vault.contractAddress
      );

      if (!underlyingVault.cowcentratedGovId) {
        throw new Error('Underlying vault does not have a gov id');
      }

      const rewardPool = selectGovVaultById(getState(), underlyingVault.cowcentratedGovId);
      if (!isCowcentratedGovVault(rewardPool)) {
        throw new Error('Reward pool is not a cowcentrated gov vault');
      }
      this.rewardPool = rewardPool;
      this.rewardPoolShareToken = selectErc20TokenByAddress(
        getState(),
        rewardPool.chainId,
        rewardPool.contractAddress
      );
    } else if (isGovVault(vault) && isGovVaultCowcentrated(vault)) {
      if (!isGovVaultType(vaultType)) {
        throw new Error('Vault type is not a gov vault type');
      }
      this.rewardPool = vault;
      this.rewardPoolType = vaultType;
      this.rewardPoolShareToken = selectErc20TokenByAddress(
        getState(),
        vault.chainId,
        vault.contractAddress
      );

      if (!underlyingVault.cowcentratedStandardId) {
        throw new Error('Underlying vault does not have a standard vault id');
      }

      const standardVault = selectVaultById(getState(), underlyingVault.cowcentratedStandardId);
      if (!isCowcentratedStandardVault(standardVault)) {
        throw new Error('Standard vault is not a cowcentrated standard vault');
      }
      this.vault = standardVault;
      this.vaultShareToken = selectErc20TokenByAddress(
        getState(),
        standardVault.chainId,
        standardVault.contractAddress
      );
    }
  }

  protected async connectSecondVaultEntity() {
    const { getState } = this.helpers;
    if (!this.rewardPoolType) {
      const builder = await getVaultTypeBuilder(this.rewardPool);
      this.rewardPoolType = await builder(this.rewardPool, getState);
    } else {
      const builder = await getVaultTypeBuilder(this.vault);
      this.vaultType = await builder(this.vault, getState);
    }
  }

  async fetchDepositOptions(): Promise<RewardPoolToVaultDepositOption[]> {
    if (!isCowcentratedStandardVault(this.mainVault)) {
      // Vault -> Reward Pool
      const inputs = [this.vaultShareToken];
      const selectionId = createSelectionId(this.rewardPool.chainId, inputs);
      const optionId = createOptionId(this.id, this.rewardPool.id, selectionId);

      return [
        {
          id: optionId,
          strategyId,
          chainId: this.rewardPool.chainId,
          vaultId: this.rewardPool.id,
          selectionId,
          selectionOrder: 0,
          inputs,
          wantedOutputs: [this.rewardPoolType.depositToken],
          mode: TransactMode.Deposit,
        },
      ] as const satisfies RewardPoolToVaultDepositOption[];
    } else {
      // Reward Pool -> Vault
      const inputs = [this.rewardPoolShareToken];

      const selectionId = createSelectionId(this.vault.chainId, inputs);
      const optionId = createOptionId(this.id, this.vault.id, selectionId);

      return [
        {
          id: optionId,
          strategyId,
          chainId: this.vault.chainId,
          vaultId: this.vault.id,
          selectionId,
          selectionOrder: 0,
          inputs,
          wantedOutputs: [this.vaultType.depositToken],
          mode: TransactMode.Deposit,
        },
      ] as const satisfies RewardPoolToVaultDepositOption[];
    }
  }

  async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: RewardPoolToVaultDepositOption
  ): Promise<RewardPoolToVaultDepositQuote> {
    await this.connectSecondVaultEntity();
    if (isCowcentratedStandardVault(this.mainVault)) {
      return this.fetchRewardPoolToVaultDepositQuote(inputs, option);
    } else {
      return this.fetchVaultToRewardPoolDepositQuote(inputs, option);
    }
  }

  protected async fetchRewardPoolToVaultDepositQuote(
    inputs: InputTokenAmount[],
    option: RewardPoolToVaultDepositOption
  ): Promise<RewardPoolToVaultDepositQuote> {
    const input = onlyOneInput(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Quote called with 0 input amount');
    }
    const { zap } = this.helpers;

    const zapSteps: ZapQuoteStep[] = [
      {
        type: 'unstake',
        outputs: [
          {
            token: this.rewardPoolType.depositToken,
            amount: input.amount,
          },
        ],
      },
      {
        type: 'deposit',
        inputs: [
          {
            token: this.depositToken,
            amount: input.amount,
          },
        ],
      },
    ];

    const depositQuote = await this.vaultType.fetchDepositQuote(
      [
        {
          token: this.depositToken,
          amount: input.amount,
          max: false,
        },
      ],
      option
    );

    return {
      id: createQuoteId(option.id),
      strategyId,
      inputs,
      outputs: depositQuote.outputs,
      returned: [],
      allowances: [
        {
          token: this.rewardPoolShareToken,
          amount: input.amount,
          spenderAddress: zap.manager,
        },
      ],
      priceImpact: 0,
      fee: ZERO_FEE,
      steps: zapSteps,
      option,
    };
  }

  protected async fetchVaultToRewardPoolDepositQuote(
    inputs: InputTokenAmount[],
    option: RewardPoolToVaultDepositOption
  ): Promise<RewardPoolToVaultDepositQuote> {
    const input = onlyOneInput(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Quote called with 0 input amount');
    }
    const { zap } = this.helpers;

    const vaultWithdrawQuote = await this.vaultType.fetchWithdrawQuote(
      [
        {
          token: this.depositToken,
          amount: input.amount,
          max: input.max,
        },
      ],
      {
        ...option,
        mode: TransactMode.Withdraw,
      }
    );

    const zapSteps: ZapQuoteStep[] = [
      {
        type: 'withdraw',
        outputs: [
          {
            token: this.rewardPoolType.depositToken,
            amount: vaultWithdrawQuote.outputs[0].amount,
          },
        ],
      },
      {
        type: 'stake',
        inputs: [
          {
            token: this.depositToken,
            amount: vaultWithdrawQuote.outputs[0].amount,
          },
        ],
      },
    ];

    return {
      id: createQuoteId(option.id),
      strategyId,
      inputs,
      outputs: [
        {
          token: this.rewardPoolShareToken,
          amount: vaultWithdrawQuote.outputs[0].amount,
        },
      ],
      returned: [],
      allowances: [
        {
          token: this.vaultShareToken,
          amount: input.amount,
          spenderAddress: zap.manager,
        },
      ],
      priceImpact: 0,
      fee: ZERO_FEE,
      steps: zapSteps,
      option,
    };
  }

  async fetchDepositStep(
    quote: RewardPoolToVaultDepositQuote,
    t: TFunction<Namespace, undefined>
  ): Promise<Step> {
    await this.connectSecondVaultEntity();

    return isCowcentratedStandardVault(this.mainVault)
      ? this.fetchRewardPoolToVaultDepositStep(quote, t)
      : this.fetchVaultToRewardPoolDepositStep(quote, t);
  }

  async fetchRewardPoolToVaultDepositStep(
    quote: RewardPoolToVaultDepositQuote,
    t: TFunction<Namespace, undefined>
  ): Promise<Step> {
    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const state = this.helpers.getState();
      const chain = selectChainById(state, this.vault.chainId);
      const slippage = selectTransactSlippage(state);
      const zapHelpers: ZapHelpers = { chain, slippage, state };
      const unstakeStep = quote.steps.find(isZapQuoteStepUnstake);
      if (!unstakeStep) {
        throw new Error('Quote missing unstake step');
      }
      const depositStep = quote.steps.find(isZapQuoteStepDeposit);
      if (!depositStep) {
        throw new Error('Quote missing deposit step');
      }

      const unstakeZap = await this.fetchZapUnstakeStep(unstakeStep, zapHelpers);
      const depositZap = await this.vaultType.fetchZapDeposit({
        inputs: depositStep.inputs.map(i => ({ ...i, max: true })),
      });

      const dustOutputs: OrderOutput[] = unstakeZap.outputs.map(output => ({
        token: output.token.address,
        minOutputAmount: '0',
      }));

      const requiredOutputs: OrderOutput[] = depositZap.outputs.map(output => ({
        token: output.token.address,
        minOutputAmount: toWeiString(
          slipBy(output.amount, slippage, output.token.decimals),
          output.token.decimals
        ),
      }));

      const outputs = uniqBy(requiredOutputs.concat(dustOutputs), output => output.token);

      const zapRequest: UserlessZapRequest = {
        order: {
          inputs: quote.inputs.map(input => ({
            token: input.token.address,
            amount: toWeiString(input.amount, input.token.decimals),
          })),
          outputs: outputs,
          relay: NO_RELAY,
        },
        steps: [...unstakeZap.zaps, depositZap.zap],
      };

      const expectedTokens = quote.outputs.map(output => output.token);

      const walletAction = walletActions.zapExecuteOrder(
        quote.option.vaultId,
        zapRequest,
        expectedTokens
      );

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

  protected async fetchVaultToRewardPoolDepositStep(
    quote: RewardPoolToVaultDepositQuote,
    t: TFunction<Namespace, undefined>
  ): Promise<Step> {
    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const state = this.helpers.getState();
      const chain = selectChainById(state, this.vault.chainId);
      const slippage = selectTransactSlippage(state);
      const zapHelpers: ZapHelpers = { chain, slippage, state };
      const withdrawStep = quote.steps.find(isZapQuoteStepWithdraw);

      if (!withdrawStep) {
        throw new Error('Quote missing withdraw step');
      }
      const stakeStep = quote.steps.find(isZapQuoteStepStake);
      if (!stakeStep) {
        throw new Error('Quote missing stake step');
      }

      const withdrawZap = await this.vaultType.fetchZapWithdraw({
        inputs: quote.inputs.map(i => ({ ...i, token: this.depositToken })),
      });
      const stakeZap = await this.fetchZapStakeStep(withdrawZap.outputs, zapHelpers);

      const dustOutputs: OrderOutput[] = withdrawZap.outputs.map(output => ({
        token: output.token.address,
        minOutputAmount: '0',
      }));

      const requiredOutputs: OrderOutput[] = stakeZap.outputs.map(output => ({
        token: output.token.address,
        minOutputAmount: toWeiString(
          slipBy(output.amount, slippage, output.token.decimals),
          output.token.decimals
        ),
      }));

      const outputs = uniqBy(requiredOutputs.concat(dustOutputs), output => output.token);

      const zapRequest: UserlessZapRequest = {
        order: {
          inputs: quote.inputs.map(input => ({
            token: input.token.address,
            amount: toWeiString(input.amount, input.token.decimals),
          })),
          outputs: outputs,
          relay: NO_RELAY,
        },
        steps: [withdrawZap.zap, ...stakeZap.zaps],
      };

      const expectedTokens = quote.outputs.map(output => output.token);

      const walletAction = walletActions.zapExecuteOrder(
        quote.option.vaultId,
        zapRequest,
        expectedTokens
      );

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

  // Vault -> Reward Pool
  async fetchWithdrawOptions(): Promise<RewardPoolToVaultWithdrawOption[]> {
    return [];
  }

  async fetchWithdrawQuote(
    _inputs: InputTokenAmount[],
    _option: RewardPoolToVaultWithdrawOption
  ): Promise<never> {
    throw new Error('Method not implemented.');
  }

  async fetchWithdrawStep(_quote: never, _t: TFunction<Namespace, undefined>): Promise<Step> {
    throw new Error('Method not implemented.');
  }

  async fetchZapUnstakeStep(
    quoteStep: ZapQuoteStepUnstake,
    zapHelpers: ZapHelpers
  ): Promise<ZapStepResponse> {
    const { zap } = this.helpers;
    const { slippage } = zapHelpers;
    return this.getZapUnstake({
      inputs: [
        {
          token: this.rewardPoolShareToken,
          amount: quoteStep.outputs[0].amount,
        },
      ],
      outputs: quoteStep.outputs,
      maxSlippage: slippage,
      zapRouter: zap.router,
      insertBalance: true,
    });
  }

  protected async getZapUnstake(request: ZapStepRequest): Promise<ZapStepResponse> {
    const { inputs, outputs } = request;
    if (outputs.length !== 1) throw new Error('Invalid outputs');
    if (inputs.length !== 1) throw new Error('Invalid inputs');
    if (!isTokenEqual(inputs[0].token, this.rewardPoolShareToken))
      throw new Error('Invalid input token');
    if (!isTokenEqual(outputs[0].token, this.depositToken)) throw new Error('Invalid output token');

    return {
      inputs,
      outputs,
      minOutputs: outputs,
      returned: [],
      zaps: [
        this.buildZapUnstakeTx(
          this.rewardPool.contractAddress,
          toWei(inputs[0].amount, inputs[0].token.decimals)
        ),
      ],
    };
  }

  protected buildZapUnstakeTx(govVaultAddress: string, amount: BigNumber): ZapStep {
    return {
      target: govVaultAddress,
      value: '0',
      data: abiCoder.encodeFunctionCall(
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
          outputs: [],
        },
        [amount.toString(10)]
      ),
      tokens: [
        {
          token: govVaultAddress,
          index: getInsertIndex(0),
        },
      ],
    };
  }

  protected async fetchZapStakeStep(
    minInputs: TokenAmount[],
    zapHelpers: ZapHelpers
  ): Promise<ZapStepResponse> {
    const { zap } = this.helpers;
    const { slippage } = zapHelpers;

    return await this.getZapStake({
      inputs: minInputs,
      outputs: [
        {
          token: this.rewardPoolShareToken,
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
          this.rewardPool.contractAddress,
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
}
