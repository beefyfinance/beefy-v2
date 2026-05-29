import BigNumber from 'bignumber.js';
import { type Abi, type Address, encodeFunctionData } from 'viem';
import { ERC20Abi } from '../../../../../config/abi/ERC20Abi.ts';
import { toWeiString } from '../../../../../helpers/big-number.ts';
import type { ChainEntity } from '../../../entities/chain.ts';
import { isTokenNative, type TokenEntity } from '../../../entities/token.ts';
import type { VaultEntity } from '../../../entities/vault.ts';
import { selectChainWrappedNativeToken } from '../../../selectors/tokens.ts';
import { selectVaultById } from '../../../selectors/vaults.ts';
import { selectZapFeeConfigByChainId } from '../../../selectors/zap.ts';
import type { BeefyState } from '../../../store/types.ts';
import {
  isZapQuoteStepFee,
  type ZapFee,
  type ZapQuoteStep,
  type ZapQuoteStepFee,
} from '../transact-types.ts';
import type { UserlessZapOrder, ZapStep } from '../zap/types.ts';
import type { TransactHelpers } from '../strategies/IStrategy.ts';
import { slipBy } from './amounts.ts';
import { ZERO_FEE } from './quotes.ts';
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
  // User-facing endpoints of the zap (never the mid-route bridge/routing token); waivers match on these.
  input: ZapFeeEndpoint;
  output: ZapFeeEndpoint;
};

// Endpoint matcher: a token/vault endpoint matches if any listed fact matches.
export type ZapFeeEndpointMatcher = {
  token?: {
    ids?: string[];
    addresses?: string[];
    symbols?: string[];
    oracleIds?: string[];
    tags?: string[];
  };
  vault?: {
    ids?: string[];
    platformIds?: string[];
    strategyTypeIds?: string[];
    assetTypes?: string[];
    assetIds?: string[];
  };
};

type ZapFeeConditionParams = { from?: ZapFeeEndpointMatcher; to?: ZapFeeEndpointMatcher };

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
    !!v.assetIds?.some(id => vault.assetIds.includes(id))
  );
}

// Named fee-waiver conditions; config references them by key. Unknown key = no waiver (fail-closed).
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

export type ZapFeeWaiver = { id: string; condition: string; params: ZapFeeConditionParams };

// Fee waivers (remote-config later); empty = none. Unknown condition = ignored (fail-closed).
const zapFeeWaivers: ZapFeeWaiver[] = [];

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

function resolveZapFee(
  state: BeefyState,
  ctx: ZapFeeContext
): { bps: number; recipient: string } | undefined {
  const config = selectZapFeeConfigByChainId(state, ctx.chainId);
  if (!config?.recipient) {
    return undefined;
  }
  const bps = config.bps ?? ZAP_FEE_BPS;
  if (bps <= 0) {
    return undefined;
  }
  if (
    zapFeeWaivers.some(waiver => {
      const condition = zapFeeConditions[waiver.condition];
      return condition ? condition(state, ctx, waiver.params) : false;
    })
  ) {
    return undefined;
  }
  return { bps, recipient: config.recipient };
}

function buildFeeQuoteStep(
  token: TokenEntity,
  grossAmount: BigNumber,
  recipient: string,
  bps: number
): ZapQuoteStepFee {
  const { feeAmount, netAmount } = computeFeeSplit(grossAmount, token, bps);
  return { type: 'fee', token, grossAmount, feeAmount, netAmount, recipient, bps };
}

export function maybeFeeQuoteStep(
  state: BeefyState,
  ctx: ZapFeeContext,
  token: TokenEntity,
  grossAmount: BigNumber
): ZapQuoteStepFee | undefined {
  const fee = resolveZapFee(state, ctx);
  return fee ? buildFeeQuoteStep(token, grossAmount, fee.recipient, fee.bps) : undefined;
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

export function feeFromQuoteSteps(steps: ZapQuoteStep[]): ZapFee {
  const feeStep = steps.find(isZapQuoteStepFee);
  return feeStep ? { value: feeStep.bps / BPS_DENOMINATOR } : ZERO_FEE;
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
