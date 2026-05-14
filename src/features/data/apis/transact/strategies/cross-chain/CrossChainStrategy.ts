import type BigNumber from 'bignumber.js';
import type { Namespace, TFunction } from 'react-i18next';
import type { Address } from 'viem';
import { toWeiBigInt, toWeiString } from '../../../../../../helpers/big-number.ts';
import type { TokenEntity, TokenErc20 } from '../../../../entities/token.ts';
import type { ChainEntity } from '../../../../entities/chain.ts';
import type { VaultEntity } from '../../../../entities/vault.ts';
import type { Step } from '../../../../reducers/wallet/stepper-types.ts';
import { TransactMode } from '../../../../reducers/wallet/transact-types.ts';
import type { CrossChainRecoveryParams } from '../../../../reducers/wallet/transact-types.ts';
import type { CrossChainExecuteMetadata } from '../../../../actions/wallet/cross-chain.ts';
import { selectTokenByAddress } from '../../../../selectors/tokens.ts';
import { selectTransactSlippage } from '../../../../selectors/transact.ts';
import { selectVaultById } from '../../../../selectors/vaults.ts';
import { selectWalletAddress } from '../../../../selectors/wallet.ts';
import { selectZapByChainId } from '../../../../selectors/zap.ts';
import {
  buildBurnZapStep,
  computeMaxFee,
  fetchBridgeQuote,
  getChainConfig,
  getSupportedChainIds,
  getUSDCForChain,
  isChainSupported,
  buildHookData,
} from '../../cctp/CCTPProvider.ts';
import type { ZapPayload } from '../../cctp/types.ts';
import { bridgeSlippageReturned, mergeTokenAmounts, slipBy } from '../../helpers/amounts.ts';
import {
  createOptionId,
  createQuoteId,
  createSelectionId,
  onlyOneInput,
} from '../../helpers/options.ts';
import {
  calculatePriceImpact,
  highestFeeOrZero,
  totalValueOfTokenAmounts,
} from '../../helpers/quotes.ts';
import { NO_RELAY } from '../../helpers/zap.ts';
import {
  type AllowanceTokenAmount,
  type CrossChainDepositOption,
  type CrossChainDepositQuote,
  type CrossChainWithdrawOption,
  type CrossChainWithdrawQuote,
  type InputTokenAmount,
  type RecoveryQuote,
  SelectionOrder,
  type TokenAmount,
  type ZapFee,
  type ZapQuoteStep,
  type ZapQuoteStepBridge,
  type ZapQuoteStepUnused,
} from '../../transact-types.ts';
import type { CCTPBridgeQuote } from '../../cctp/types.ts';
import type { UserlessZapRequest, ZapStep } from '../../zap/types.ts';
import {
  type ChainTransactHelpers,
  type IZapStrategy,
  type IZapStrategyStatic,
  type ZapTransactHelpers,
  isZapTransactHelpers,
} from '../IStrategy.ts';
import type { CrossChainStrategyConfig } from '../strategy-configs.ts';
import { getTransactApi } from '../../../instances.ts';
import {
  crossChainRecoveryExecuteOrder,
  crossChainZapExecuteOrder,
} from '../../../../actions/wallet/cross-chain.ts';
import { enumerateDstVaultCandidates, enumerateSrcVaultCandidates } from './enumeration.ts';
import { buildDustOutputs, mergeOutputs } from './handlers/dust.ts';
import { buildBalanceCheckZapStep, findBridgeTokenMin } from './handlers/utils.ts';
import { PassthroughDestHandler } from './handlers/PassthroughDestHandler.ts';
import { SwapDestHandler } from './handlers/SwapDestHandler.ts';
import { SwapSourceHandler } from './handlers/SwapSourceHandler.ts';
import { VaultDestHandler } from './handlers/VaultDestHandler.ts';
import { VaultSourceHandler } from './handlers/VaultSourceHandler.ts';
import type {
  DestHandlerContext,
  DestHandlerQuote,
  IDestHandler,
  ISourceHandler,
  SourceHandlerContext,
  SourceHandlerQuote,
} from './handlers/types.ts';

const strategyId = 'cross-chain';
type StrategyId = typeof strategyId;

/** Phased rollout: vault-to-vault paths dark until picker UX ships. */
const VAULT_TO_VAULT_ENABLED: boolean = false;

type CrossChainQuoteBody = {
  bridgeQuote: CCTPBridgeQuote;
  sourceSteps: ZapQuoteStep[];
  destSteps: ZapQuoteStep[];
  outputs: TokenAmount[];
  returned: TokenAmount[];
  allowances: AllowanceTokenAmount[];
  priceImpact: number;
  fee: ZapFee;
  srcHandlerQuote: SourceHandlerQuote;
  destHandlerQuote: DestHandlerQuote;
};

class CrossChainStrategyImpl implements IZapStrategy<StrategyId> {
  public static readonly id = strategyId;
  public readonly id = strategyId;

  private readonly allowedSourceChains: Set<ChainEntity['id']>;
  private readonly allowedDestChains: Set<ChainEntity['id']>;

  constructor(
    protected options: CrossChainStrategyConfig,
    protected helpers: ZapTransactHelpers
  ) {
    this.allowedSourceChains = new Set(
      (options.supportedSourceChains ?? getSupportedChainIds()).filter(isChainSupported)
    );
    this.allowedDestChains = new Set(
      (options.supportedDestChains ?? getSupportedChainIds()).filter(isChainSupported)
    );
  }

  // --- HANDLER FACTORIES ---

  private makeSourceContext(
    option: CrossChainDepositOption | CrossChainWithdrawOption
  ): SourceHandlerContext {
    return {
      helpers: this.helpers,
      sourceChainId: option.sourceChainId,
      bridgeToken: option.bridgeToken,
      slippage: selectTransactSlippage(this.helpers.getState()),
      pageVaultId: this.helpers.vault.id,
      resolveHelpersForVault: vaultId => this.resolveHelpersForVault(vaultId),
    };
  }

  /**
   * Single factory for both the normal flow and the dst-only recovery flow.
   * `pageVaultId` and `resolveHelpersForVault` are sourced off `this.helpers` because the
   * orchestrator is constructed with the page vault's helpers in both paths.
   */
  private makeDestContext(args: {
    helpers: ChainTransactHelpers;
    destChainId: ChainEntity['id'];
    destBridgeToken: TokenEntity;
  }): DestHandlerContext {
    return {
      ...args,
      slippage: selectTransactSlippage(args.helpers.getState()),
      pageVaultId: this.helpers.vault.id,
      resolveHelpersForVault: id => this.resolveHelpersForVault(id),
    };
  }

  private makeSourceHandler(
    option: CrossChainDepositOption | CrossChainWithdrawOption
  ): ISourceHandler {
    switch (option.srcHandlerKind) {
      case 'swap':
        return new SwapSourceHandler(this.options.swap);
      case 'vault':
        return new VaultSourceHandler(option.srcVaultId);
      default:
        throw new Error(
          `CrossChainStrategy: unknown srcHandlerKind ${JSON.stringify(option satisfies never)}`
        );
    }
  }

  private makeDestHandler(
    option: CrossChainDepositOption | CrossChainWithdrawOption
  ): IDestHandler {
    switch (option.destHandlerKind) {
      case 'passthrough':
        return new PassthroughDestHandler();
      case 'swap':
        return new SwapDestHandler(option.wantedOutputs[0], this.options.swap);
      case 'vault':
        return new VaultDestHandler(option.destVaultId);
      default:
        throw new Error(
          `CrossChainStrategy: unknown destHandlerKind ${JSON.stringify(option satisfies never)}`
        );
    }
  }

  private async resolveHelpersForVault(vaultId: VaultEntity['id']): Promise<ZapTransactHelpers> {
    const helpers = await (
      await getTransactApi()
    ).getHelpersForVault(vaultId, this.helpers.getState);
    if (!isZapTransactHelpers(helpers)) {
      throw new Error(`Vault ${vaultId} has no zap helpers configured`);
    }
    return helpers;
  }

  // --- BURN STEP COMPOSITION ---

  /**
   * Build the CCTP burn step. On oversize, falls back to an empty-route passthrough payload
   * and the dst leg becomes a recovery tx. `isTwoStep` is true iff a non-passthrough handler
   * hit the fallback; callers use it to mark the `PendingCrossChainOp`.
   */
  private async composeBurnStep(
    destHandler: IDestHandler,
    destHandlerQuote: DestHandlerQuote,
    destCtx: DestHandlerContext,
    args: {
      userAddress: Address;
      sourceChainId: ChainEntity['id'];
      destChainId: ChainEntity['id'];
      bridgeToken: TokenEntity;
      minBridgeToken: BigNumber;
    }
  ): Promise<{ burnStep: ZapStep; isTwoStep: boolean; expectedTokens: TokenEntity[] }> {
    const { userAddress, sourceChainId, destChainId, bridgeToken, minBridgeToken } = args;

    const sourceConfig = getChainConfig(sourceChainId);
    const maxFee =
      sourceConfig.fastFeeBps !== undefined ?
        toWeiBigInt(
          computeMaxFee(minBridgeToken, sourceConfig.fastFeeBps, bridgeToken.decimals),
          bridgeToken.decimals
        )
      : 0n;

    const destSteps = await destHandler.fetchZapSteps(destHandlerQuote, destCtx);
    const dustOutputs = buildDustOutputs(destHandlerQuote.dustTokens);
    const outputs = mergeOutputs(destSteps.orderOutputs, dustOutputs);
    const primaryPayload: ZapPayload = {
      recipient: userAddress,
      outputs,
      relay: NO_RELAY,
      route: destSteps.zapSteps,
    };
    const primary = buildHookData(sourceChainId, destChainId, primaryPayload);

    if (!primary.oversized) {
      return {
        burnStep: buildBurnZapStep(
          sourceChainId,
          destChainId,
          bridgeToken.address,
          primary.receiver,
          maxFee,
          primary.hookData
        ),
        isTwoStep: false,
        expectedTokens: destSteps.expectedTokens,
      };
    }

    // Oversize fallback: dst-side route doesn't fit hookData. Mint USDC to
    // the user via an empty-route passthrough payload; the recovery flow
    // completes the dst leg via `fetchRecoveryStep`.
    const fallbackPayload: ZapPayload = {
      recipient: userAddress,
      outputs: [{ token: destCtx.destBridgeToken.address, minOutputAmount: '0' }],
      relay: NO_RELAY,
      route: [],
    };
    const fallback = buildHookData(sourceChainId, destChainId, fallbackPayload);
    if (fallback.oversized) {
      throw new Error(`CCTP passthrough hookData oversized on chain ${destChainId}`);
    }
    return {
      burnStep: buildBurnZapStep(
        sourceChainId,
        destChainId,
        bridgeToken.address,
        fallback.receiver,
        maxFee,
        fallback.hookData
      ),
      // Passthrough → bridge token IS the user's chosen output; nothing to recover.
      isTwoStep: destHandler.kind !== 'passthrough',
      expectedTokens: [destCtx.destBridgeToken],
    };
  }

  // --- DEPOSIT ---

  async fetchDepositOptions(): Promise<CrossChainDepositOption[]> {
    const { vault, swapAggregator, getState } = this.helpers;
    const state = getState();
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const options: CrossChainDepositOption[] = [];

    await Promise.allSettled(
      [...this.allowedSourceChains].map(async sourceChainId => {
        if (sourceChainId === vault.chainId) return;

        const sourceUSDC = getUSDCForChain(sourceChainId, state);
        const destUSDC = getUSDCForChain(vault.chainId, state);
        const tokenSupport = await swapAggregator.fetchTokenSupport(
          [sourceUSDC],
          vault.id,
          sourceChainId,
          state,
          this.options.swap
        );

        for (const token of tokenSupport.any) {
          const selectionId = createSelectionId(sourceChainId, [token], 'cross-chain');
          options.push({
            id: createOptionId('cross-chain', vault.id, selectionId),
            strategyId: 'cross-chain',
            mode: TransactMode.Deposit,
            vaultId: vault.id,
            chainId: vault.chainId,
            sourceChainId,
            destChainId: vault.chainId,
            selectionId,
            selectionOrder: SelectionOrder.CrossChain,
            inputs: [token],
            wantedOutputs: [depositToken],
            bridgeToken: sourceUSDC,
            destBridgeToken: destUSDC,
            srcHandlerKind: 'swap',
            destHandlerKind: 'vault',
            destVaultId: vault.id,
            async: true,
          });
        }
      })
    );

    if (VAULT_TO_VAULT_ENABLED) {
      const v2vOptions = await this.enumerateVaultSrcDepositOptions();
      options.push(...v2vOptions);
    }

    return options;
  }

  /**
   * Vault-to-vault deposit enumeration: for each user-held vault on a CCTP-supported other
   * chain that can withdraw to USDC, emit a `srcHandlerKind='vault'` option.
   */
  private async enumerateVaultSrcDepositOptions(): Promise<CrossChainDepositOption[]> {
    const { vault, getState } = this.helpers;
    const state = getState();
    const walletAddress = selectWalletAddress(state);
    if (!walletAddress) return [];

    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const destUSDC = getUSDCForChain(vault.chainId, state);
    const results: CrossChainDepositOption[] = [];

    const candidates = await enumerateSrcVaultCandidates(
      vault.id,
      state,
      walletAddress,
      this.allowedSourceChains
    );
    for (const candidate of candidates) {
      const sourceUSDC = getUSDCForChain(candidate.chainId, state);
      const srcVault = selectVaultById(state, candidate.vaultId);
      if (!srcVault || !('contractAddress' in srcVault)) continue;
      const shareToken = selectTokenByAddress(state, candidate.chainId, srcVault.contractAddress);
      const selectionId = createSelectionId(
        candidate.chainId,
        [shareToken],
        `cross-chain-vault:${candidate.vaultId}`
      );
      results.push({
        id: createOptionId('cross-chain', vault.id, selectionId, candidate.vaultId),
        strategyId: 'cross-chain',
        mode: TransactMode.Deposit,
        vaultId: vault.id,
        chainId: vault.chainId,
        sourceChainId: candidate.chainId,
        destChainId: vault.chainId,
        selectionId,
        selectionOrder: SelectionOrder.CrossChain,
        // Hide the picker row when the user's src vault balance is zero —
        // otherwise we surface a row they cannot act on.
        selectionHideIfZeroBalance: true,
        inputs: [shareToken],
        wantedOutputs: [depositToken],
        bridgeToken: sourceUSDC,
        destBridgeToken: destUSDC,
        srcHandlerKind: 'vault',
        destHandlerKind: 'vault',
        srcVaultId: candidate.vaultId,
        destVaultId: vault.id,
        async: true,
      });
    }
    return results;
  }

  /**
   * Direction-agnostic quote assembly; `fetchDepositQuote` and `fetchWithdrawQuote` adapt
   * this into their respective quote shapes.
   */
  private async quoteCrossChain(
    input: InputTokenAmount,
    option: CrossChainDepositOption | CrossChainWithdrawOption
  ): Promise<CrossChainQuoteBody> {
    const state = this.helpers.getState();
    const srcCtx = this.makeSourceContext(option);
    const destCtx = this.makeDestContext({
      helpers: this.helpers,
      destChainId: option.destChainId,
      destBridgeToken: option.destBridgeToken,
    });
    const srcHandler = this.makeSourceHandler(option);
    const destHandler = this.makeDestHandler(option);

    const srcHandlerQuote = await srcHandler.fetchQuote(input, srcCtx);

    // CCTP bridge — slip only when src produced the bridge token via swap/withdraw.
    const bridgeUsdcAmount =
      srcHandlerQuote.slippageAppliesToBridge ?
        slipBy(srcHandlerQuote.bridgeTokenOut, srcCtx.slippage, srcCtx.bridgeToken.decimals)
      : srcHandlerQuote.bridgeTokenOut;
    const bridgeQuote = fetchBridgeQuote(
      srcCtx.sourceChainId,
      destCtx.destChainId,
      bridgeUsdcAmount,
      srcCtx.bridgeToken as TokenErc20,
      destCtx.destBridgeToken as TokenErc20
    );

    const sourceSteps: ZapQuoteStep[] = [
      ...srcHandlerQuote.sourceSteps,
      {
        type: 'bridge',
        bridgeId: 'cctp',
        fromChainId: srcCtx.sourceChainId,
        toChainId: destCtx.destChainId,
        fromToken: srcCtx.bridgeToken,
        toToken: destCtx.destBridgeToken,
        fromAmount: bridgeQuote.fromAmount,
        toAmount: bridgeQuote.toAmount,
        timeEstimate: bridgeQuote.timeEstimate,
      } satisfies ZapQuoteStepBridge,
    ];

    const destHandlerQuote = await destHandler.fetchQuote(bridgeQuote.toAmount, destCtx);

    // Slippage buffer — excess bridge token arrives on dst as an `unused` step.
    const destSlippageReturn = bridgeSlippageReturned(
      srcHandlerQuote.bridgeTokenOut,
      bridgeUsdcAmount,
      bridgeQuote,
      destCtx.destBridgeToken
    );
    const destSteps: ZapQuoteStep[] =
      destSlippageReturn ?
        [
          ...destHandlerQuote.destSteps,
          { type: 'unused', outputs: [destSlippageReturn] } satisfies ZapQuoteStepUnused,
        ]
      : destHandlerQuote.destSteps;

    const returned = mergeTokenAmounts(
      srcHandlerQuote.returned,
      destSlippageReturn ? [destSlippageReturn] : [],
      destHandlerQuote.returned
    );

    return {
      bridgeQuote,
      sourceSteps,
      destSteps,
      outputs: destHandlerQuote.outputs,
      returned,
      allowances: srcHandlerQuote.allowances,
      priceImpact: calculatePriceImpact(
        [input],
        destHandlerQuote.outputs,
        returned,
        state,
        totalValueOfTokenAmounts([{ token: bridgeQuote.fromToken, amount: bridgeQuote.fee }], state)
      ),
      fee: highestFeeOrZero([...sourceSteps, ...destSteps]),
      srcHandlerQuote,
      destHandlerQuote,
    };
  }

  async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: CrossChainDepositOption
  ): Promise<CrossChainDepositQuote> {
    if (option.sourceChainId === option.destChainId) {
      throw new Error('CrossChainStrategy: same-chain deposit option reached fetchDepositQuote');
    }
    const body = await this.quoteCrossChain(onlyOneInput(inputs), option);
    return {
      id: createQuoteId(option.id),
      strategyId: 'cross-chain',
      option,
      inputs,
      srcHandlerKind: option.srcHandlerKind,
      destHandlerKind: option.destHandlerKind,
      ...body,
      steps: [...body.sourceSteps, ...body.destSteps],
    };
  }

  /**
   * Direction-agnostic step assembly; deposit and withdraw both delegate here.
   * `order.inputs` comes from the source handler: vault-src produces the share token (mooToken),
   * swap-src produces the user's input token; the Zap Router uses it to `transferFrom` the user.
   */
  private async stepCrossChain(
    quote: CrossChainDepositQuote | CrossChainWithdrawQuote,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const state = this.helpers.getState();
    const { sourceChainId, destChainId, bridgeToken, destBridgeToken } = quote.option;
    const userAddress = selectWalletAddress(state);
    if (!userAddress) {
      throw new Error('No wallet connected');
    }

    const sourceZap = selectZapByChainId(state, sourceChainId);
    if (!sourceZap) {
      throw new Error(`No zap router on source chain ${sourceChainId}`);
    }

    const srcCtx = this.makeSourceContext(quote.option);
    const destCtx = this.makeDestContext({
      helpers: this.helpers,
      destChainId: quote.option.destChainId,
      destBridgeToken: quote.option.destBridgeToken,
    });
    const srcHandler = this.makeSourceHandler(quote.option);
    const destHandler = this.makeDestHandler(quote.option);

    const { srcHandlerQuote, destHandlerQuote } = quote;

    const srcSteps = await srcHandler.fetchZapSteps(srcHandlerQuote, srcCtx);
    const minBridgeToken = findBridgeTokenMin(srcSteps.orderOutputs, bridgeToken);

    const { burnStep, isTwoStep, expectedTokens } = await this.composeBurnStep(
      destHandler,
      destHandlerQuote,
      destCtx,
      {
        userAddress: userAddress as Address,
        sourceChainId,
        destChainId,
        bridgeToken,
        minBridgeToken,
      }
    );

    const balanceCheck = buildBalanceCheckZapStep(
      bridgeToken.address,
      sourceZap.router,
      toWeiString(minBridgeToken, bridgeToken.decimals)
    );
    const sourceZapSteps: ZapStep[] = [...srcSteps.zapSteps, balanceCheck, burnStep];

    // Source outputs = dust only; bridge token is burned by CCTP.
    const sourceOutputs = buildDustOutputs(srcHandlerQuote.dustTokens);

    const zapRequest: UserlessZapRequest = {
      order: {
        inputs: srcSteps.orderInputs,
        outputs: sourceOutputs,
        relay: NO_RELAY,
      },
      steps: sourceZapSteps,
    };

    const metadata = this.buildRecoveryMetadata(
      quote,
      { token: destBridgeToken, amount: quote.bridgeQuote.toAmount },
      isTwoStep
    );

    const isDeposit = quote.option.mode === TransactMode.Deposit;

    return {
      step: isDeposit ? 'zap-in' : 'zap-out',
      message: t('Vault-TxnConfirm', {
        type: t(isDeposit ? 'Deposit-noun' : 'Withdraw-noun'),
      }),
      action: crossChainZapExecuteOrder(
        sourceChainId,
        quote.option.vaultId,
        zapRequest,
        expectedTokens,
        metadata
      ),
      pending: false,
      extraInfo: {
        zap: true,
        vaultId: quote.option.vaultId,
        crossChain: { sourceChainId, destChainId },
      },
    };
  }

  async fetchDepositStep(quote: CrossChainDepositQuote, t: TFunction<Namespace>): Promise<Step> {
    return this.stepCrossChain(quote, t);
  }

  // --- WITHDRAW ---

  async fetchWithdrawOptions(): Promise<CrossChainWithdrawOption[]> {
    const { vault, swapAggregator, getState } = this.helpers;
    const state = getState();
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const options: CrossChainWithdrawOption[] = [];

    if (!isChainSupported(vault.chainId)) return [];

    const sourceUSDC = getUSDCForChain(vault.chainId, state);

    await Promise.allSettled(
      [...this.allowedDestChains].map(async destChainId => {
        if (destChainId === vault.chainId) return;

        const destUSDC = getUSDCForChain(destChainId, state);

        // USDC output (no hooks)
        const usdcSelectionId = createSelectionId(destChainId, [destUSDC], 'cross-chain-withdraw');
        options.push({
          id: createOptionId('cross-chain', vault.id, usdcSelectionId),
          strategyId: 'cross-chain',
          mode: TransactMode.Withdraw,
          vaultId: vault.id,
          chainId: vault.chainId,
          sourceChainId: vault.chainId,
          destChainId,
          selectionId: usdcSelectionId,
          selectionOrder: SelectionOrder.CrossChain,
          inputs: [depositToken],
          wantedOutputs: [destUSDC],
          bridgeToken: sourceUSDC,
          destBridgeToken: destUSDC,
          srcHandlerKind: 'vault',
          srcVaultId: vault.id,
          destHandlerKind: 'passthrough',
          async: true,
        });

        // Non-USDC outputs (with hooks for dest swap)
        const destTokenSupport = await swapAggregator.fetchTokenSupport(
          [destUSDC],
          vault.id,
          destChainId,
          state,
          this.options.swap
        );

        for (const token of destTokenSupport.any) {
          if (token.address.toLowerCase() === destUSDC.address.toLowerCase()) continue;

          const selectionId = createSelectionId(destChainId, [token], 'cross-chain-withdraw');
          options.push({
            id: createOptionId('cross-chain', vault.id, selectionId),
            strategyId: 'cross-chain',
            mode: TransactMode.Withdraw,
            vaultId: vault.id,
            chainId: vault.chainId,
            sourceChainId: vault.chainId,
            destChainId,
            selectionId,
            selectionOrder: SelectionOrder.CrossChain,
            inputs: [depositToken],
            wantedOutputs: [token],
            bridgeToken: sourceUSDC,
            destBridgeToken: destUSDC,
            srcHandlerKind: 'vault',
            srcVaultId: vault.id,
            destHandlerKind: 'swap',
            async: true,
          });
        }
      })
    );

    if (VAULT_TO_VAULT_ENABLED) {
      const v2vOptions = await this.enumerateVaultDstWithdrawOptions();
      options.push(...v2vOptions);
    }

    return options;
  }

  /**
   * Vault-to-vault withdraw enumeration: emit a `destHandlerKind='vault'` option per dst-vault
   * candidate on every supported chain other than the page vault's.
   */
  private async enumerateVaultDstWithdrawOptions(): Promise<CrossChainWithdrawOption[]> {
    const { vault, getState } = this.helpers;
    const state = getState();
    if (!isChainSupported(vault.chainId)) return [];

    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const sourceUSDC = getUSDCForChain(vault.chainId, state);
    const results: CrossChainWithdrawOption[] = [];

    const candidates = await enumerateDstVaultCandidates(vault.id, state, this.allowedDestChains);
    for (const candidate of candidates) {
      const destVault = selectVaultById(state, candidate.vaultId);
      if (!destVault || !('contractAddress' in destVault)) continue;
      const destUSDC = getUSDCForChain(candidate.chainId, state);
      const destShareToken = selectTokenByAddress(
        state,
        candidate.chainId,
        destVault.contractAddress
      );
      const selectionId = createSelectionId(
        candidate.chainId,
        [destShareToken],
        `cross-chain-withdraw-vault:${candidate.vaultId}`
      );
      results.push({
        id: createOptionId('cross-chain', vault.id, selectionId, candidate.vaultId),
        strategyId: 'cross-chain',
        mode: TransactMode.Withdraw,
        vaultId: vault.id,
        chainId: vault.chainId,
        sourceChainId: vault.chainId,
        destChainId: candidate.chainId,
        selectionId,
        selectionOrder: SelectionOrder.CrossChain,
        inputs: [depositToken],
        wantedOutputs: [destShareToken],
        bridgeToken: sourceUSDC,
        destBridgeToken: destUSDC,
        srcHandlerKind: 'vault',
        srcVaultId: vault.id,
        destHandlerKind: 'vault',
        destVaultId: candidate.vaultId,
        async: true,
      });
    }
    return results;
  }

  async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: CrossChainWithdrawOption
  ): Promise<CrossChainWithdrawQuote> {
    if (option.sourceChainId === option.destChainId) {
      throw new Error('CrossChainStrategy: same-chain withdraw option reached fetchWithdrawQuote');
    }
    const body = await this.quoteCrossChain(onlyOneInput(inputs), option);
    return {
      id: createQuoteId(option.id),
      strategyId: 'cross-chain',
      option,
      inputs,
      srcHandlerKind: option.srcHandlerKind,
      destHandlerKind: option.destHandlerKind,
      ...body,
      steps: [...body.sourceSteps, ...body.destSteps],
    };
  }

  async fetchWithdrawStep(quote: CrossChainWithdrawQuote, t: TFunction<Namespace>): Promise<Step> {
    return this.stepCrossChain(quote, t);
  }

  // --- RECOVERY ---

  private buildRecoveryMetadata(
    quote: CrossChainDepositQuote | CrossChainWithdrawQuote,
    bridgedAmount: { token: TokenEntity; amount: BigNumber },
    twoStep?: boolean
  ): CrossChainExecuteMetadata {
    const { sourceChainId, destChainId, vaultId } = quote.option;
    const direction = quote.option.mode === TransactMode.Deposit ? 'deposit' : 'withdraw';
    const base = {
      destChainId,
      bridgeTokenAddress: bridgedAmount.token.address,
      bridgedAmount: bridgedAmount.amount.toString(10),
    };

    let recovery: CrossChainRecoveryParams;
    switch (quote.option.destHandlerKind) {
      case 'passthrough':
        recovery = { ...base, destHandlerKind: 'passthrough' };
        break;
      case 'swap':
        recovery = {
          ...base,
          destHandlerKind: 'swap',
          desiredOutputAddress: quote.option.wantedOutputs[0].address,
        };
        break;
      case 'vault':
        recovery = {
          ...base,
          destHandlerKind: 'vault',
          destVaultId: quote.option.destVaultId,
        };
        break;
      default:
        throw new Error(
          `CrossChainStrategy: unknown destHandlerKind ${JSON.stringify(quote.option satisfies never)}`
        );
    }

    return {
      opId: `xchain-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      direction,
      sourceChainId,
      destChainId,
      vaultId,
      sourceInput: { token: quote.inputs[0].token, amount: quote.inputs[0].amount },
      expectedOutput: { token: quote.outputs[0].token, amount: quote.outputs[0].amount },
      sourceDisplaySteps: quote.sourceSteps,
      destDisplaySteps: quote.destSteps,
      recovery,
      twoStep,
    };
  }

  private makeRecoveryHandler(
    recovery: Exclude<CrossChainRecoveryParams, { destHandlerKind: 'passthrough' }>,
    destChainHelpers: ChainTransactHelpers
  ): IDestHandler {
    switch (recovery.destHandlerKind) {
      case 'swap': {
        const desiredOutput = selectTokenByAddress(
          destChainHelpers.getState(),
          recovery.destChainId,
          recovery.desiredOutputAddress
        );
        return new SwapDestHandler(desiredOutput, this.options.swap);
      }
      case 'vault':
        return new VaultDestHandler(recovery.destVaultId);
      default:
        throw new Error(
          `CrossChainStrategy: unknown recovery destHandlerKind ${JSON.stringify(recovery satisfies never)}`
        );
    }
  }

  /**
   * Captures the inner DestHandlerQuote on `RecoveryQuote.destHandlerQuote` so the step path
   * can reuse it without re-querying the aggregator (no display-vs-execution route drift).
   */
  async fetchRecoveryQuote(
    recovery: Exclude<CrossChainRecoveryParams, { destHandlerKind: 'passthrough' }>,
    bridgedAmount: BigNumber,
    destChainHelpers: ChainTransactHelpers
  ): Promise<RecoveryQuote> {
    const destBridgeToken = selectTokenByAddress(
      destChainHelpers.getState(),
      recovery.destChainId,
      recovery.bridgeTokenAddress
    );
    const destCtx = this.makeDestContext({
      helpers: destChainHelpers,
      destChainId: recovery.destChainId,
      destBridgeToken,
    });
    const handler = this.makeRecoveryHandler(recovery, destChainHelpers);
    const quoteVaultId =
      recovery.destHandlerKind === 'vault' ? recovery.destVaultId : this.helpers.vault.id;

    const handlerQuote = await handler.fetchQuote(bridgedAmount, destCtx);
    const state = destCtx.helpers.getState();
    const inputs: InputTokenAmount[] = [
      { token: destCtx.destBridgeToken, amount: bridgedAmount, max: false },
    ];
    return {
      id: createQuoteId(`recovery-${destCtx.destChainId}-${quoteVaultId}`),
      inputs,
      outputs: handlerQuote.outputs,
      returned: handlerQuote.returned,
      steps: handlerQuote.destSteps,
      priceImpact: calculatePriceImpact(inputs, handlerQuote.outputs, handlerQuote.returned, state),
      fee: highestFeeOrZero(handlerQuote.destSteps),
      allowances: handlerQuote.allowances,
      destHandlerQuote: handlerQuote,
    };
  }

  /**
   * Reuses the captured `DestHandlerQuote` on `quote.destHandlerQuote` and calls fetchZapSteps
   * directly — no second fetchQuote call.
   */
  async fetchRecoveryStep(
    recovery: Exclude<CrossChainRecoveryParams, { destHandlerKind: 'passthrough' }>,
    quote: RecoveryQuote,
    destChainHelpers: ChainTransactHelpers,
    opId: string,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const destBridgeToken = selectTokenByAddress(
      destChainHelpers.getState(),
      recovery.destChainId,
      recovery.bridgeTokenAddress
    );
    const destCtx = this.makeDestContext({
      helpers: destChainHelpers,
      destChainId: recovery.destChainId,
      destBridgeToken,
    });
    const handler = this.makeRecoveryHandler(recovery, destChainHelpers);
    const attributedVaultId =
      recovery.destHandlerKind === 'vault' ? recovery.destVaultId : this.helpers.vault.id;

    const handlerQuote = quote.destHandlerQuote;
    const bridgedAmount = quote.inputs[0].amount;

    const steps = await handler.fetchZapSteps(handlerQuote, destCtx);
    const dustOutputs = buildDustOutputs(handlerQuote.dustTokens);
    const outputs = mergeOutputs(steps.orderOutputs, dustOutputs);

    const zapRequest: UserlessZapRequest = {
      order: {
        inputs: [
          {
            token: destCtx.destBridgeToken.address,
            amount: toWeiString(bridgedAmount, destCtx.destBridgeToken.decimals),
          },
        ],
        outputs,
        relay: NO_RELAY,
      },
      steps: steps.zapSteps,
    };

    const isDepositLike = handler.kind === 'vault';
    return {
      step: isDepositLike ? 'zap-in' : 'zap-out',
      message: t('Vault-TxnConfirm', {
        type: t(isDepositLike ? 'Deposit-noun' : 'Withdraw-noun'),
      }),
      action: crossChainRecoveryExecuteOrder(
        opId,
        destCtx.destChainId,
        attributedVaultId,
        zapRequest,
        steps.expectedTokens
      ),
      pending: false,
      extraInfo: { zap: true, vaultId: attributedVaultId },
    };
  }
}

export const CrossChainStrategy = CrossChainStrategyImpl satisfies IZapStrategyStatic<StrategyId>;
