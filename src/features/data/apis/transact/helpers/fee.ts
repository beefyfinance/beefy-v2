import BigNumber from 'bignumber.js';
import { type Abi, type Address, encodeFunctionData } from 'viem';
import { ERC20Abi } from '../../../../../config/abi/ERC20Abi.ts';
import { toWeiString } from '../../../../../helpers/big-number.ts';
import type { ChainEntity } from '../../../entities/chain.ts';
import { isTokenNative, type TokenEntity } from '../../../entities/token.ts';
import type { VaultEntity } from '../../../entities/vault.ts';
import { selectChainWrappedNativeToken } from '../../../selectors/tokens.ts';
import { selectVaultById } from '../../../selectors/vaults.ts';
import { selectValidZapFeeRules, selectZapFeeConfigByChainId } from '../../../selectors/zap.ts';
import type { BeefyState } from '../../../store/types.ts';
import type { ZapFeeEndpointMatcher, ZapFeeRule } from '../../config-types.ts';
import type {
  OptionFeeCampaign,
  ZapFee,
  ZapFeeCharge,
  ZapQuoteStepFee,
} from '../transact-types.ts';
import type { UserlessZapOrder, ZapStep } from '../zap/types.ts';
import { slipBy } from './amounts.ts';
import {
  isWithinZapFeeWindow,
  pickLowestZapFee,
  tokenMatchesMatcher,
  vaultMatchesMatcher,
  ZAP_FEE_BPS,
  type ZapFeeMatch,
} from './fee-rules.ts';
import { nativeAndWrappedAreSame } from './tokens.ts';
import { isOptionFeeable } from './options.ts';
import { getTokenAddress } from './zap.ts';
import {
  isCrossChainOption,
  isDepositOption,
  isVaultToVaultSingleTokenOption,
  type TransactOption,
} from '../transact-types.ts';

const BPS_DENOMINATOR = 10000;

export type ZapFeeEndpoint =
  | { kind: 'token'; token: TokenEntity }
  | { kind: 'vault'; vaultId: VaultEntity['id'] }
  | { kind: 'any' };

export type ZapFeeContext = {
  // User-facing endpoints of the zap (never the mid-route bridge/routing token); campaigns match on these.
  // The charged chain is derived from the input endpoint (see chargedChainId).
  input: ZapFeeEndpoint;
  output: ZapFeeEndpoint;
};

// The chain the fee is charged on = the input endpoint's chain ({any} = unknown ⇒ no charge).
function chargedChainId(state: BeefyState, input: ZapFeeEndpoint): ChainEntity['id'] | undefined {
  if (input.kind === 'token') {
    return input.token.chainId;
  }
  if (input.kind === 'vault') {
    return selectVaultById(state, input.vaultId).chainId;
  }
  return undefined;
}

function endpointMatches(
  state: BeefyState,
  endpoint: ZapFeeEndpoint,
  matcher: ZapFeeEndpointMatcher
): boolean {
  if (endpoint.kind === 'any') {
    return false;
  }
  if (endpoint.kind === 'token') {
    return !!matcher.token && tokenMatchesMatcher(endpoint.token, matcher.token);
  }
  return (
    !!matcher.vault && vaultMatchesMatcher(selectVaultById(state, endpoint.vaultId), matcher.vault)
  );
}

// Matches when the time window holds and every constrained side matches the concrete endpoint. An absent
// side (input or output) is unconstrained and passes; chain scoping lives inside the endpoint matchers.
function ruleAppliesToZap(
  state: BeefyState,
  ctx: ZapFeeContext,
  rule: ZapFeeRule,
  nowSeconds: number
): boolean {
  if (!isWithinZapFeeWindow(rule, nowSeconds)) {
    return false;
  }
  if (rule.input && !endpointMatches(state, ctx.input, rule.input)) {
    return false;
  }
  if (rule.output && !endpointMatches(state, ctx.output, rule.output)) {
    return false;
  }
  return true;
}

function computeFeeSplit(
  grossAmount: BigNumber,
  token: TokenEntity,
  bps: number
): { feeAmount: BigNumber; netAmount: BigNumber } {
  const feeAmount = grossAmount
    .multipliedBy(bps)
    .dividedBy(BPS_DENOMINATOR)
    .decimalPlaces(token.decimals, BigNumber.ROUND_FLOOR);
  return { feeAmount, netAmount: grossAmount.minus(feeAmount) };
}

function computeZapFee(state: BeefyState, ctx: ZapFeeContext): ZapFeeMatch | undefined {
  const chainId = chargedChainId(state, ctx.input);
  if (!chainId) {
    return undefined;
  }
  const config = selectZapFeeConfigByChainId(state, chainId);
  if (!config?.recipient) {
    return undefined;
  }
  const baseBps = config.bps ?? ZAP_FEE_BPS;
  if (baseBps <= 0) {
    return undefined;
  }
  const nowSeconds = Math.floor(Date.now() / 1000);
  return pickLowestZapFee(selectValidZapFeeRules(state), baseBps, config.recipient, rule =>
    ruleAppliesToZap(state, ctx, rule, nowSeconds)
  );
}

// The fee-matching endpoints for any option — the single source used by both the display badge
// (resolveOptionFeeCampaign) and the charge path (the strategies). Direction-agnostic: the vault side is the
// page/handoff vault, the token side is the user's wallet token, and which is input vs output follows the
// option's own (already direction-correct) fields. Returns undefined for shapes not fee-charged here.
export function optionFeeEndpoints(option: TransactOption): ZapFeeContext | undefined {
  if (isVaultToVaultSingleTokenOption(option)) {
    return {
      input: { kind: 'vault', vaultId: option.srcVaultId },
      output: { kind: 'vault', vaultId: option.destVaultId },
    };
  }
  if (isCrossChainOption(option)) {
    // Narrow on the *HandlerKind discriminants (the deposit/withdraw types are asymmetric in which *VaultId
    // they carry) — same derivation CrossChainStrategy.quoteCrossChain uses.
    const input: ZapFeeEndpoint =
      option.srcHandlerKind === 'vault' ?
        { kind: 'vault', vaultId: option.srcVaultId }
      : { kind: 'token', token: option.inputs[0] };
    const output: ZapFeeEndpoint =
      option.destHandlerKind === 'vault' ?
        { kind: 'vault', vaultId: option.destVaultId }
      : { kind: 'token', token: option.wantedOutputs[0] };
    return { input, output };
  }
  // Plain shape: a single token on the wallet side, the page vault on the other.
  if (isDepositOption(option)) {
    if (option.inputs.length !== 1) {
      return undefined;
    }
    return {
      input: { kind: 'token', token: option.inputs[0] },
      output: { kind: 'vault', vaultId: option.vaultId },
    };
  }
  if (option.wantedOutputs.length !== 1) {
    return undefined;
  }
  return {
    input: { kind: 'vault', vaultId: option.vaultId },
    output: { kind: 'token', token: option.wantedOutputs[0] },
  };
}

// Display-only campaign for an option (deposit or withdraw). Resolved once at option-build time; returns
// undefined unless a campaign actually reduces the fee. The charged fee is recomputed at quote time via
// resolveZapFee over the same optionFeeEndpoints, so this never drives execution.
export function resolveOptionFeeCampaign(
  state: BeefyState,
  option: TransactOption
): OptionFeeCampaign | undefined {
  const endpoints = optionFeeEndpoints(option);
  if (!endpoints) {
    return undefined;
  }
  const fee = computeZapFee(state, endpoints);
  if (!fee || fee.effectiveBps >= fee.baseBps) {
    return undefined;
  }
  return { effectiveBps: fee.effectiveBps, baseBps: fee.baseBps };
}

// The UI fee object (quote.fee shape): the effective % plus, when a campaign reduced it, the original.
function buildZapFeeDisplay(fee: ZapFeeMatch): ZapFee {
  const reduced = fee.effectiveBps < fee.baseBps;
  return {
    value: fee.effectiveBps / BPS_DENOMINATOR,
    ...(reduced ?
      {
        campaign: {
          original: fee.baseBps / BPS_DENOMINATOR,
          ...(fee.winner?.description ? { description: fee.winner.description } : {}),
          ...(fee.winner?.id ? { id: fee.winner.id } : {}),
        },
      }
    : {}),
  };
}

// Amount-independent zap fee % for an option; {value: 0} when nothing is charged (so the row shows "0%").
export function computeOptionZapFee(state: BeefyState, option: TransactOption): ZapFee {
  const endpoints = optionFeeEndpoints(option);
  if (!endpoints || !isOptionFeeable(option)) {
    return { value: 0 };
  }
  const fee = computeZapFee(state, endpoints);
  return fee ? buildZapFeeDisplay(fee) : { value: 0 };
}

// One computation → two outputs: `display` is the UI fee on quote.fee; `step` is the execution fee in
// quote.steps. A full waive yields display only (value 0 + original), so the row shows it with no step.
export function resolveZapFee(
  state: BeefyState,
  ctx: ZapFeeContext,
  token: TokenEntity,
  grossAmount: BigNumber
): { display: ZapFee; step?: ZapQuoteStepFee } | undefined {
  const fee = computeZapFee(state, ctx);
  if (!fee) {
    return undefined;
  }
  const { feeAmount, netAmount } = computeFeeSplit(grossAmount, token, fee.effectiveBps);
  const reduced = fee.effectiveBps < fee.baseBps;
  const charge: ZapFeeCharge = {
    token,
    recipient: fee.recipient,
    bps: fee.effectiveBps,
    grossAmount,
    feeAmount,
    netAmount,
  };
  const step: ZapQuoteStepFee | undefined =
    fee.effectiveBps > 0 ?
      { type: 'fee', ...charge, ...(reduced ? { originalBps: fee.baseBps } : {}) }
    : undefined;
  return { display: buildZapFeeDisplay(fee), step };
}

// ERC20: single transfer. Native: wrap to wnative then transfer, so the recipient always gets the ERC20.
export function buildFeeZapSteps(args: {
  state: BeefyState;
  token: TokenEntity;
  grossAmount: BigNumber;
  recipient: string;
  bps: number;
}): { zaps: ZapStep[]; feeAmount: BigNumber; netAmount: BigNumber } {
  const { state, token, grossAmount, recipient, bps } = args;
  const { feeAmount, netAmount } = computeFeeSplit(grossAmount, token, bps);
  if (feeAmount.isZero()) {
    return { zaps: [], feeAmount, netAmount };
  }
  const feeAmountWei = toWeiString(feeAmount, token.decimals);

  if (!isTokenNative(token)) {
    return { zaps: [transferStep(token.address, recipient, feeAmountWei)], feeAmount, netAmount };
  }

  const wnative = selectChainWrappedNativeToken(state, token.chainId);
  if (nativeAndWrappedAreSame(token.chainId)) {
    return { zaps: [transferStep(wnative.address, recipient, feeAmountWei)], feeAmount, netAmount };
  }

  return {
    zaps: [
      wrapStep(wnative.address, feeAmountWei),
      transferStep(wnative.address, recipient, feeAmountWei),
    ],
    feeAmount,
    netAmount,
  };
}

export function feeZapStepsFromQuoteStep(
  feeStep: ZapQuoteStepFee,
  state: BeefyState
): { zaps: ZapStep[]; feeAmount: BigNumber } {
  const { zaps, feeAmount } = buildFeeZapSteps({
    state,
    token: feeStep.token,
    grossAmount: feeStep.grossAmount,
    recipient: feeStep.recipient,
    bps: feeStep.bps,
  });
  return { zaps, feeAmount };
}

// Push the slip-aware fee transfer and lower the fee-token order output to slipBy(gross) − execFee.
export function applyWithdrawFeeToOrder(
  order: UserlessZapOrder,
  steps: ZapStep[],
  feeStep: ZapQuoteStepFee,
  state: BeefyState,
  slippage: number
): void {
  const execGross = slipBy(feeStep.grossAmount, slippage, feeStep.token.decimals);
  const { zaps, feeAmount } = buildFeeZapSteps({
    state,
    token: feeStep.token,
    grossAmount: execGross,
    recipient: feeStep.recipient,
    bps: feeStep.bps,
  });
  steps.push(...zaps);

  const feeTokenAddress = getTokenAddress(feeStep.token).toLowerCase();
  const floorWei = toWeiString(execGross.minus(feeAmount), feeStep.token.decimals);
  const entry = order.outputs.find(output => output.token.toLowerCase() === feeTokenAddress);
  if (!entry) {
    throw new Error('applyWithdrawFeeToOrder: fee-basis output not found in order');
  }
  // Lower only: the inner floored at slipBy(gross); the fixed fee transfer needs slipBy(gross) − execFee.
  if (new BigNumber(entry.minOutputAmount).gt(floorWei)) {
    entry.minOutputAmount = floorWei;
  }
}

// Fixed-amount transfer (tokens: []) so the router moves exactly feeAmount, not its full balance.
function transferStep(tokenAddress: string, recipient: string, amountWei: string): ZapStep {
  return {
    target: tokenAddress,
    value: '0',
    data: encodeFunctionData({
      abi: ERC20Abi,
      functionName: 'transfer',
      args: [recipient as Address, BigInt(amountWei)],
    }),
    tokens: [],
  };
}

function wrapStep(wnativeAddress: string, amountWei: string): ZapStep {
  return {
    target: wnativeAddress,
    value: amountWei,
    data: encodeFunctionData({
      abi: [
        {
          type: 'function',
          name: 'deposit',
          constant: false,
          stateMutability: 'payable',
          payable: true,
          inputs: [],
          outputs: [],
        },
      ] as const satisfies Abi,
    }),
    tokens: [],
  };
}
