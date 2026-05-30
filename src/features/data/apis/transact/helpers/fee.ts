import BigNumber from 'bignumber.js';
import { type Abi, type Address, encodeFunctionData } from 'viem';
import { ERC20Abi } from '../../../../../config/abi/ERC20Abi.ts';
import { toWeiString } from '../../../../../helpers/big-number.ts';
import type { ChainEntity } from '../../../entities/chain.ts';
import { isTokenNative, type TokenEntity } from '../../../entities/token.ts';
import type { VaultEntity } from '../../../entities/vault.ts';
import { selectChainWrappedNativeToken } from '../../../selectors/tokens.ts';
import { selectVaultById } from '../../../selectors/vaults.ts';
import { selectZapFeeConfigByChainId, selectZapFeeRules } from '../../../selectors/zap.ts';
import type { BeefyState } from '../../../store/types.ts';
import type {
  ZapFeeConditionParams,
  ZapFeeEndpointMatcher,
  ZapFeeRule,
} from '../../config-types.ts';
import type { ZapFee, ZapFeeCharge, ZapQuoteStepFee } from '../transact-types.ts';
import type { UserlessZapOrder, ZapStep } from '../zap/types.ts';
import type { TransactHelpers } from '../strategies/IStrategy.ts';
import { slipBy } from './amounts.ts';
import { nativeAndWrappedAreSame } from './tokens.ts';
import { getTokenAddress } from './zap.ts';

const ZAP_FEE_BPS = 5;
const BPS_DENOMINATOR = 10000;

export type ZapFeeEndpoint =
  | { kind: 'token'; token: TokenEntity }
  | { kind: 'vault'; vaultId: VaultEntity['id'] };

export type ZapFeeContext = {
  chainId: ChainEntity['id'];
  vaultId: VaultEntity['id'];
  // User-facing endpoints of the zap (never the mid-route bridge/routing token); campaigns match on these.
  input: ZapFeeEndpoint;
  output: ZapFeeEndpoint;
};

function endpointMatches(
  state: BeefyState,
  endpoint: ZapFeeEndpoint,
  matcher: ZapFeeEndpointMatcher
): boolean {
  if (endpoint.kind === 'token') {
    const t = matcher.token;
    if (!t) {
      return false;
    }
    const { token } = endpoint;
    const address = token.address.toLowerCase();
    return (
      !!t.ids?.includes(token.id) ||
      !!t.addresses?.some(a => a.toLowerCase() === address) ||
      !!t.symbols?.includes(token.symbol) ||
      !!t.oracleIds?.includes(token.oracleId) ||
      !!t.tags?.some(tag => token.tags.includes(tag))
    );
  }
  const v = matcher.vault;
  if (!v) {
    return false;
  }
  const vault = selectVaultById(state, endpoint.vaultId);
  return (
    !!v.ids?.includes(vault.id) ||
    !!v.platformIds?.includes(vault.platformId) ||
    !!v.strategyTypeIds?.includes(vault.strategyTypeId) ||
    !!v.assetTypes?.includes(vault.assetType) ||
    !!v.assetIds?.some(id => vault.assetIds.includes(id)) ||
    !!v.statuses?.includes(vault.status)
  );
}

// Named fee-campaign conditions; config references them by key. Unknown key = no match (fail-closed).
const zapFeeConditions: Record<
  string,
  (state: BeefyState, ctx: ZapFeeContext, params: ZapFeeConditionParams) => boolean
> = {
  zapFromFree: (state, ctx, params) =>
    !!params.from && endpointMatches(state, ctx.input, params.from),
  zapToFree: (state, ctx, params) => !!params.to && endpointMatches(state, ctx.output, params.to),
  subsetToSubsetFree: (state, ctx, params) =>
    !!params.from &&
    !!params.to &&
    endpointMatches(state, ctx.input, params.from) &&
    endpointMatches(state, ctx.output, params.to),
};

const warnedInvalidZapFeeRuleIds = new Set<string>();

// Validate a config-authored rule against the code vocabulary; invalid ones are dropped (fail-closed).
function validateZapFeeRule(rule: ZapFeeRule): boolean {
  if (typeof rule?.id !== 'string') {
    return false;
  }
  if (rule.kind !== 'waive' && rule.kind !== 'discount') {
    return false;
  }
  if (rule.kind === 'discount' && (!Number.isInteger(rule.bps) || (rule.bps ?? -1) < 0)) {
    return false;
  }
  if (rule.condition !== undefined) {
    if (!(rule.condition in zapFeeConditions)) {
      return false;
    }
    if (rule.condition === 'zapFromFree' && !rule.params?.from) {
      return false;
    }
    if (rule.condition === 'zapToFree' && !rule.params?.to) {
      return false;
    }
    if (rule.condition === 'subsetToSubsetFree' && !(rule.params?.from && rule.params?.to)) {
      return false;
    }
  }
  return true;
}

function getActiveZapFeeRules(state: BeefyState): ZapFeeRule[] {
  return selectZapFeeRules(state).filter(rule => {
    if (validateZapFeeRule(rule)) {
      return true;
    }
    const id = typeof rule?.id === 'string' ? rule.id : 'unknown';
    if (!warnedInvalidZapFeeRuleIds.has(id)) {
      warnedInvalidZapFeeRuleIds.add(id);
      console.warn(`Ignoring invalid zap fee rule "${id}"`);
    }
    return false;
  });
}

// Applies when the time window + chain scope hold and the optional condition matches (absent = any).
function ruleApplies(
  state: BeefyState,
  ctx: ZapFeeContext,
  rule: ZapFeeRule,
  nowSeconds: number
): boolean {
  if (rule.startsAt !== undefined && nowSeconds < rule.startsAt) {
    return false;
  }
  if (rule.endsAt !== undefined && nowSeconds > rule.endsAt) {
    return false;
  }
  if (rule.chainIds && !rule.chainIds.includes(ctx.chainId)) {
    return false;
  }
  if (!rule.condition) {
    return true;
  }
  const condition = zapFeeConditions[rule.condition];
  return condition ? condition(state, ctx, rule.params ?? {}) : false;
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

// Lowest effective bps wins
function computeZapFee(
  state: BeefyState,
  ctx: ZapFeeContext
): { effectiveBps: number; baseBps: number; recipient: string; winner?: ZapFeeRule } | undefined {
  const config = selectZapFeeConfigByChainId(state, ctx.chainId);
  if (!config?.recipient) {
    return undefined;
  }
  const baseBps = config.bps ?? ZAP_FEE_BPS;
  if (baseBps <= 0) {
    return undefined;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  let effectiveBps = baseBps;
  let winner: ZapFeeRule | undefined;
  for (const rule of getActiveZapFeeRules(state)) {
    if (!ruleApplies(state, ctx, rule, nowSeconds)) {
      continue;
    }
    const ruleBps = rule.kind === 'discount' ? Math.min(rule.bps ?? baseBps, baseBps) : 0;
    if (ruleBps < effectiveBps) {
      effectiveBps = ruleBps;
      winner = rule;
    }
    if (effectiveBps <= 0) {
      break;
    }
  }

  return { effectiveBps, baseBps, recipient: config.recipient, winner };
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
  const display: ZapFee = {
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
  const step: ZapQuoteStepFee | undefined =
    fee.effectiveBps > 0 ?
      { type: 'fee', ...charge, ...(reduced ? { originalBps: fee.baseBps } : {}) }
    : undefined;
  return { display, step };
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

// chainId defaults to the vault chain; endpoints are the user-facing input/output (not bridge tokens).
export function feeContext(
  helpers: TransactHelpers,
  endpoints: { input: ZapFeeEndpoint; output: ZapFeeEndpoint },
  chainId: ChainEntity['id'] = helpers.vault.chainId
): ZapFeeContext {
  return {
    chainId,
    vaultId: helpers.vault.id,
    input: endpoints.input,
    output: endpoints.output,
  };
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
