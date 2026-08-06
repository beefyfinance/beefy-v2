import type {
  IZapStrategy,
  IZapStrategyStatic,
  UserlessZapWithdrawBreakdown,
  ZapTransactHelpers,
} from '../IStrategy.ts';
import type { YieldBasisStrategyConfig } from '../strategy-configs.ts';
import {
  type InputTokenAmount,
  isZapQuoteStepBuild,
  isZapQuoteStepUnstake,
  SelectionOrder,
  type TokenAmount,
  type ZapQuoteStep,
  type ZapStrategyIdToDepositOption,
  type ZapStrategyIdToDepositQuote,
  type ZapStrategyIdToWithdrawOption,
  type ZapStrategyIdToWithdrawQuote,
} from '../../transact-types.ts';
import {
  createOptionId,
  createQuoteId,
  createSelectionId,
  onlyOneInput,
  onlyOneToken,
  onlyOneTokenAmount,
} from '../../helpers/options.ts';
import { TransactMode } from '../../../../reducers/wallet/transact-types.ts';
import { isStandardVault, type VaultStandard } from '../../../../entities/vault.ts';
import { isStandardVaultType, type IStandardVaultType } from '../../vaults/IVaultType.ts';
import {
  selectTokenByAddress,
  selectTokenById,
  selectTokenPriceByAddress,
} from '../../../../selectors/tokens.ts';
import { isTokenEqual, isTokenErc20, type TokenEntity } from '../../../../entities/token.ts';
import { calculatePriceImpact, ZERO_FEE } from '../../helpers/quotes.ts';
import { fetchContract } from '../../../rpc-contract/viem-contract.ts';
import { type Address, encodeFunctionData, parseAbi } from 'viem';
import {
  BIG_ZERO,
  bigNumberToBigInt,
  fromWei,
  toWei,
  toWeiBigInt,
  toWeiString,
} from '../../../../../../helpers/big-number.ts';
import type { Namespace, TFunction } from 'react-i18next';
import type { Step } from '../../../../reducers/wallet/stepper-types.ts';
import type { BeefyThunk } from '../../../../store/types.ts';
import { zapExecuteOrder } from '../../../../actions/wallet/zap.ts';
import type { OrderInput, OrderOutput, UserlessZapRequest, ZapStep } from '../../zap/types.ts';
import { getInsertIndex, getTokenAddress, NO_RELAY } from '../../helpers/zap.ts';
import { uniqBy } from 'lodash-es';
import { slipBy } from '../../helpers/amounts.ts';
import { selectTransactSlippage } from '../../../../selectors/transact.ts';
import { pickTokens } from '../../helpers/tokens.ts';
import { getVaultWithdrawnFromState } from '../../helpers/vault.ts';
import { isFulfilledResult, isRejectedResult } from '../../../../../../helpers/promises.ts';
import type BigNumber from 'bignumber.js';

const strategyId = 'yieldbasis';
type StrategyId = typeof strategyId;

class YieldBasisStrategyImpl implements IZapStrategy<StrategyId> {
  public static readonly id = strategyId;
  public readonly id = strategyId;

  protected readonly vault: VaultStandard;
  protected readonly vaultType: IStandardVaultType;
  protected readonly want: TokenEntity;
  protected readonly asset: TokenEntity;
  protected readonly ybToken: TokenEntity;
  protected readonly crvUsd: TokenEntity;

  protected readonly stakeZap = '0xE862bC39B8D5F12D8c4117d3e2D493Dc20051EC6';
  protected readonly abi = parseAbi([
    'function preview_deposit(uint assets, uint debt) external view returns (uint)',
    'function preview_withdraw(uint yb) external view returns (uint)',
    'function previewDeposit(uint assets) external view returns (uint)',
    'function previewRedeem(uint shares) external view returns (uint)',
    'function deposit(uint assets, address receiver) external returns (uint)',
    'function deposit_and_stake(address gauge, uint assets, uint debt, uint min_shares) external returns (uint)',
    'function withdraw_and_unstake(address gauge, uint shares, uint min_assets) external returns (uint)',
  ]);

  constructor(
    protected options: YieldBasisStrategyConfig,
    protected helpers: ZapTransactHelpers
  ) {
    const { vault, vaultType, getState } = this.helpers;
    if (!isStandardVault(vault)) throw new Error('Vault is not a standard vault');
    if (!isStandardVaultType(vaultType)) throw new Error('Vault type is not standard');
    const state = getState();

    this.vault = vault;
    this.vaultType = vaultType;
    this.want = vaultType.depositToken;
    this.asset = selectTokenById(state, vault.chainId, vault.assetIds[0]);
    this.ybToken = selectTokenByAddress(state, vault.chainId, options.ybToken);
    this.crvUsd = selectTokenById(state, vault.chainId, 'crvUSD');
  }

  async fetchDepositOptions(): Promise<ZapStrategyIdToDepositOption<StrategyId>[]> {
    const outputs = [this.want];
    return [this.asset, this.ybToken].map(token => {
      const inputs = [token];
      const selectionId = createSelectionId(this.vault.chainId, inputs);
      return {
        id: createOptionId(this.id, this.vault.id, selectionId),
        vaultId: this.vault.id,
        chainId: this.vault.chainId,
        selectionId,
        selectionOrder: SelectionOrder.TokenOfPool,
        inputs,
        wantedOutputs: outputs,
        strategyId,
        mode: TransactMode.Deposit,
      };
    });
  }

  public async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: ZapStrategyIdToDepositOption<StrategyId>
  ): Promise<ZapStrategyIdToDepositQuote<StrategyId>> {
    const { zap, getState } = this.helpers;
    const state = getState();
    const input = onlyOneInput(inputs);

    const allowances =
      isTokenErc20(input.token) ?
        [{ token: input.token, amount: input.amount, spenderAddress: zap.manager }]
      : [];

    let ybTokenAmount: bigint;
    if (isTokenEqual(input.token, this.ybToken)) {
      ybTokenAmount = toWeiBigInt(input.amount, input.token.decimals);
    } else if (isTokenEqual(input.token, this.asset)) {
      ({ preview: ybTokenAmount } = await this.fetchYbPreviewDeposit(input));
    } else {
      throw new Error(`Unsupported token ${input.token.symbol} ${input.token.address}`);
    }

    const Gauge = fetchContract(this.want.address, this.abi, this.vault.chainId);
    const preview = await Gauge.read.previewDeposit([ybTokenAmount]);
    const amount = fromWei(preview.toString(10), this.want.decimals);

    const steps: ZapQuoteStep[] = [
      { type: 'build', inputs, outputToken: this.want, outputAmount: amount },
      { type: 'deposit', inputs: [{ token: this.want, amount }] },
    ];
    const outputs: TokenAmount[] = [{ token: this.want, amount }];
    const returned: TokenAmount[] = [];
    return {
      id: createQuoteId(option.id),
      strategyId,
      priceImpact: calculatePriceImpact(inputs, outputs, returned, state),
      option,
      inputs,
      outputs,
      returned,
      allowances,
      steps,
      fee: ZERO_FEE,
    };
  }

  async fetchDepositStep(
    quote: ZapStrategyIdToDepositQuote<StrategyId>,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const { zapRequest, expectedTokens } = await this.zapDeposit(quote);
      const walletAction = zapExecuteOrder(quote.option.vaultId, zapRequest, expectedTokens);
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

  private assetToCrvUsd(amount: BigNumber) {
    const state = this.helpers.getState();
    const assetPrice = selectTokenPriceByAddress(state, this.vault.chainId, this.asset.address);
    const crvUsdPrice = selectTokenPriceByAddress(state, this.vault.chainId, this.crvUsd.address);
    const assetValue = assetPrice.times(amount);
    // fallback to 1:1 if crvUsd is 0
    return crvUsdPrice.gt(BIG_ZERO) ? assetValue.dividedBy(crvUsdPrice) : assetValue;
  }

  async fetchYbPreviewDeposit(input: TokenAmount) {
    if (!isTokenEqual(input.token, this.asset)) {
      throw new Error('Preview input token must be the deposit asset');
    }
    const crvUsdDebt = this.assetToCrvUsd(input.amount);
    const YB = fetchContract(this.ybToken.address, this.abi, this.vault.chainId);
    const assets = toWeiBigInt(input.amount, input.token.decimals);
    const debt = toWeiBigInt(crvUsdDebt, this.crvUsd.decimals);

    // may still be able to deposit with no debt once debt limit is reached
    const [withDebt, noDebt] = await Promise.allSettled([
      YB.read.preview_deposit([assets, debt]),
      YB.read.preview_deposit([assets, 0n]),
    ]);

    const previewDebt = isFulfilledResult(withDebt) ? withDebt.value : undefined;
    const previewNoDebt = isFulfilledResult(noDebt) ? noDebt.value : undefined;

    if (previewDebt !== undefined && (previewNoDebt === undefined || previewDebt > previewNoDebt)) {
      return { debt, preview: previewDebt };
    } else if (previewNoDebt !== undefined) {
      return { debt: 0n, preview: previewNoDebt };
    }

    throw new Error('YieldBasisStrategy: preview_deposit failed', {
      cause:
        isRejectedResult(noDebt) ? noDebt.reason
        : isRejectedResult(withDebt) ? withDebt.reason
        : undefined,
    });
  }

  async zapDeposit(
    quote: ZapStrategyIdToDepositQuote<StrategyId>
  ): Promise<UserlessZapWithdrawBreakdown> {
    const state = this.helpers.getState();
    const slippage = selectTransactSlippage(state);
    const steps: ZapStep[] = [];

    const buildQuote = quote.steps.find(isZapQuoteStepBuild);
    if (!buildQuote) throw new Error('YieldBasisStrategy: No build step in quote');

    const input = onlyOneTokenAmount(buildQuote.inputs);
    const inputWei = toWei(input.amount, input.token.decimals);
    const inputBigInt = bigNumberToBigInt(inputWei);

    if (isTokenEqual(input.token, this.asset)) {
      const { debt } = await this.fetchYbPreviewDeposit(input);
      steps.push({
        target: this.stakeZap,
        data: encodeFunctionData({
          abi: this.abi,
          functionName: 'deposit_and_stake',
          args: [this.want.address as Address, inputBigInt, debt, 0n],
        }),
        value: '0',
        tokens: [{ token: input.token.address, index: -1 }],
      });
    } else if (isTokenEqual(input.token, this.ybToken)) {
      steps.push({
        target: this.want.address,
        data: encodeFunctionData({
          abi: this.abi,
          functionName: 'deposit',
          args: [inputBigInt, this.helpers.zap.router as Address],
        }),
        value: '0',
        tokens: [{ token: input.token.address, index: -1 }],
      });
    } else {
      throw new Error(`Unsupported token ${input.token.symbol} ${input.token.address}`);
    }

    const vaultDeposit = await this.vaultType.fetchZapDeposit({
      inputs: [{ token: buildQuote.outputToken, amount: buildQuote.outputAmount, max: true }],
      from: this.helpers.zap.router,
    });
    steps.push(vaultDeposit.zap);

    const inputs: OrderInput[] = quote.inputs.map(input => ({
      token: getTokenAddress(input.token),
      amount: toWeiString(input.amount, input.token.decimals),
    }));
    const requiredOutputs: OrderOutput[] = vaultDeposit.outputs.map(output => ({
      token: getTokenAddress(output.token),
      minOutputAmount: toWeiString(
        slipBy(output.amount, slippage, output.token.decimals),
        output.token.decimals
      ),
    }));
    const dustOutputs: OrderOutput[] = pickTokens(quote.outputs, quote.inputs, quote.returned).map(
      token => ({ token: getTokenAddress(token), minOutputAmount: '0' })
    );
    const outputs = uniqBy(requiredOutputs.concat(dustOutputs), output => output.token);

    const zapRequest: UserlessZapRequest = { order: { inputs, outputs, relay: NO_RELAY }, steps };
    const expectedTokens = vaultDeposit.outputs.map(output => output.token);
    return { zapRequest, expectedTokens };
  }

  async fetchWithdrawOptions(): Promise<ZapStrategyIdToWithdrawOption<StrategyId>[]> {
    return [this.asset].map(token => {
      const selectionId = createSelectionId(this.vault.chainId, [token]);
      return {
        id: createOptionId(this.id, this.vault.id, selectionId),
        vaultId: this.vault.id,
        chainId: this.vault.chainId,
        selectionId,
        selectionOrder: SelectionOrder.TokenOfPool,
        inputs: [this.want],
        wantedOutputs: [token],
        strategyId,
        mode: TransactMode.Withdraw,
      };
    });
  }

  async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: ZapStrategyIdToWithdrawOption<StrategyId>
  ): Promise<ZapStrategyIdToWithdrawQuote<StrategyId>> {
    const { zap, getState } = this.helpers;
    const state = getState();
    const input = onlyOneInput(inputs);
    const output = onlyOneToken(option.wantedOutputs);
    if (!isTokenEqual(output, this.asset)) {
      throw new Error(`Unsupported token ${output.symbol} ${output.address}`);
    }

    const { withdrawnAmountAfterFeeWei, withdrawnToken, shareToken, sharesToWithdrawWei } =
      getVaultWithdrawnFromState(input, this.vault, state);
    const withdrawnAmountAfterFee = fromWei(withdrawnAmountAfterFeeWei, withdrawnToken.decimals);

    const approveAmount = fromWei(sharesToWithdrawWei, shareToken.decimals);
    const allowances = [{ token: shareToken, amount: approveAmount, spenderAddress: zap.manager }];

    const Gauge = fetchContract(this.want.address, this.abi, this.vault.chainId);
    const ybOut = await Gauge.read.previewRedeem([bigNumberToBigInt(withdrawnAmountAfterFeeWei)]);
    const YB = fetchContract(this.ybToken.address, this.abi, this.vault.chainId);
    const preview = await YB.read.preview_withdraw([ybOut]);
    const amount = fromWei(preview.toString(10), this.asset.decimals);

    const steps: ZapQuoteStep[] = [
      { type: 'withdraw', outputs: [{ token: withdrawnToken, amount: withdrawnAmountAfterFee }] },
      { type: 'unstake', outputs: [{ token: output, amount }] },
    ];
    const outputs: TokenAmount[] = [{ token: output, amount }];
    const returned: TokenAmount[] = [];
    return {
      id: createQuoteId(option.id),
      strategyId,
      priceImpact: calculatePriceImpact(inputs, outputs, returned, state),
      option,
      inputs,
      outputs,
      returned,
      allowances,
      steps,
      fee: ZERO_FEE,
    };
  }

  async fetchWithdrawStep(
    quote: ZapStrategyIdToWithdrawQuote<StrategyId>,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const { zapRequest, expectedTokens } = await this.zapWithdraw(quote);
      const walletAction = zapExecuteOrder(quote.option.vaultId, zapRequest, expectedTokens);
      return walletAction(dispatch, getState, extraArgument);
    };
    return {
      step: 'zap-out',
      message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
      action: zapAction,
      pending: false,
      extraInfo: { zap: true, vaultId: quote.option.vaultId },
    };
  }

  async zapWithdraw(
    quote: ZapStrategyIdToWithdrawQuote<StrategyId>
  ): Promise<UserlessZapWithdrawBreakdown> {
    const state = this.helpers.getState();
    const slippage = selectTransactSlippage(state);
    const unstakeQuote = quote.steps.find(isZapQuoteStepUnstake);
    if (!unstakeQuote) throw new Error('Withdraw quote missing withdraw or unstake step');

    const vaultWithdraw = await this.vaultType.fetchZapWithdraw({
      inputs: quote.inputs,
      from: this.helpers.zap.router,
    });
    const steps: ZapStep[] = [vaultWithdraw.zap];

    const wantOutput = onlyOneTokenAmount(vaultWithdraw.outputs);
    const wantWei = toWei(wantOutput.amount, wantOutput.token.decimals);

    const output = onlyOneTokenAmount(unstakeQuote.outputs);
    if (isTokenEqual(output.token, this.asset)) {
      steps.push({
        target: this.stakeZap,
        data: encodeFunctionData({
          abi: this.abi,
          functionName: 'withdraw_and_unstake',
          args: [wantOutput.token.address as Address, bigNumberToBigInt(wantWei), 0n],
        }),
        value: '0',
        tokens: [{ token: wantOutput.token.address, index: getInsertIndex(1) }],
      });
    } else {
      throw new Error(`Unsupported token ${output.token.symbol} ${output.token.address}`);
    }

    const inputs: OrderInput[] = vaultWithdraw.inputs.map(input => ({
      token: getTokenAddress(input.token),
      amount: toWeiString(input.amount, input.token.decimals),
    }));
    const requiredOutputs: OrderOutput[] = quote.outputs.map(output => ({
      token: getTokenAddress(output.token),
      minOutputAmount: toWeiString(
        slipBy(output.amount, slippage, output.token.decimals),
        output.token.decimals
      ),
    }));
    const dustOutputs: OrderOutput[] = pickTokens(
      vaultWithdraw.inputs,
      quote.outputs,
      quote.inputs,
      quote.returned,
      unstakeQuote.outputs
    ).map(token => ({ token: getTokenAddress(token), minOutputAmount: '0' }));
    const outputs = uniqBy(requiredOutputs.concat(dustOutputs), output => output.token);
    const zapRequest: UserlessZapRequest = { order: { inputs, outputs, relay: NO_RELAY }, steps };
    const expectedTokens = quote.outputs.map(output => output.token);
    return { zapRequest, expectedTokens };
  }
}

export const YieldBasisStrategy = YieldBasisStrategyImpl satisfies IZapStrategyStatic<StrategyId>;
