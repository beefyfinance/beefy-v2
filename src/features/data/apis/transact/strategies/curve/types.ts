import type { TokenEntity } from '../../../../entities/token';

export type CurveMethodTypes =
  | 'fixed'
  | 'fixed-deposit'
  | 'fixed-deposit-underlying'
  | 'dynamic-deposit'
  | 'pool-fixed'
  | 'pool-fixed-deposit';

type CurveMethodSignatures = {
  depositQuote: string;
  deposit: string;
  withdrawQuote: string;
  withdraw: string;
};

const curveMethodTypeToSignatures = {
  fixed: {
    depositQuote: 'calc_token_amount:fixed_amounts',
    deposit: 'add_liquidity:fixed_amounts/min_amount',
    withdrawQuote: 'calc_withdraw_one_coin:amount/index',
    withdraw: 'remove_liquidity_one_coin:amount/index/min_amount',
  },
  'fixed-deposit': {
    depositQuote: 'calc_token_amount:fixed_amounts/is_deposit',
    deposit: 'add_liquidity:fixed_amounts/min_amount',
    withdrawQuote: 'calc_withdraw_one_coin:amount/index',
    withdraw: 'remove_liquidity_one_coin:amount/index/min_amount',
  },
  'fixed-deposit-underlying': {
    depositQuote: 'calc_token_amount:fixed_amounts/is_deposit',
    deposit: 'add_liquidity:fixed_amounts/min_amount/use_underlying',
    withdrawQuote: 'calc_withdraw_one_coin:amount/index',
    withdraw: 'remove_liquidity_one_coin:amount/index/min_amount/use_underlying',
  },
  'dynamic-deposit': {
    depositQuote: 'calc_token_amount:dynamic_amounts/is_deposit',
    deposit: 'add_liquidity:dynamic_amounts/min_amount',
    withdrawQuote: 'calc_withdraw_one_coin:amount/index',
    withdraw: 'remove_liquidity_one_coin:amount/index/min_amount',
  },
  'pool-fixed': {
    depositQuote: 'calc_token_amount:pool/fixed_amounts',
    deposit: 'add_liquidity:pool/fixed_amounts/min_amount',
    withdrawQuote: 'calc_withdraw_one_coin:pool/amount/index',
    withdraw: 'remove_liquidity_one_coin:pool/amount/index/min_amount',
  },
  'pool-fixed-deposit': {
    depositQuote: 'calc_token_amount:pool/fixed_amounts/is_deposit',
    deposit: 'add_liquidity:pool/fixed_amounts/min_amount',
    withdrawQuote: 'calc_withdraw_one_coin:pool/amount/index',
    withdraw: 'remove_liquidity_one_coin:pool/amount/index/min_amount',
  },
} as const satisfies Record<CurveMethodTypes, CurveMethodSignatures>;

export type CurveMethodTypeToSignaturesMap = typeof curveMethodTypeToSignatures;

type MakeCurveMethod<T extends CurveMethodTypes> = {
  type: T;
  target: string;
  coins: string[];
};

type CurveMethodFixed = MakeCurveMethod<'fixed'>;
type CurveMethodFixedDeposit = MakeCurveMethod<'fixed-deposit'>;
type CurveMethodFixedDepositUnderlying = MakeCurveMethod<'fixed-deposit-underlying'>;
type CurveMethodDynamicDeposit = MakeCurveMethod<'dynamic-deposit'>;
type CurveMethodPoolFixed = MakeCurveMethod<'pool-fixed'>;
type CurveMethodPoolFixedDeposit = MakeCurveMethod<'pool-fixed-deposit'>;

export type CurveMethod =
  | CurveMethodFixed
  | CurveMethodFixedDeposit
  | CurveMethodFixedDepositUnderlying
  | CurveMethodDynamicDeposit
  | CurveMethodPoolFixed
  | CurveMethodPoolFixedDeposit;

function makeIsCurveMethod<T extends CurveMethodTypes>(
  type: T
): (method: CurveMethod | MakeCurveMethod<T>) => method is MakeCurveMethod<T> {
  return (method: CurveMethod | MakeCurveMethod<T>): method is MakeCurveMethod<T> =>
    method.type === type;
}

export const isCurveMethodFixed = makeIsCurveMethod('fixed');
export const isCurveMethodFixedDeposit = makeIsCurveMethod('fixed-deposit');
export const isCurveMethodFixedDepositUnderlying = makeIsCurveMethod('fixed-deposit-underlying');
export const isCurveMethodDynamicDeposit = makeIsCurveMethod('dynamic-deposit');
export const isCurveMethodPoolFixed = makeIsCurveMethod('pool-fixed');
export const isCurveMethodPoolFixedDeposit = makeIsCurveMethod('pool-fixed-deposit');

export function getMethodSignaturesForType<T extends CurveMethodTypes>(
  type: T
): CurveMethodTypeToSignaturesMap[T] {
  return curveMethodTypeToSignatures[type];
}

export function getCurveMethodsSignatures<T extends CurveMethodTypes>(
  method: MakeCurveMethod<T>
): CurveMethodTypeToSignaturesMap[T] {
  return curveMethodTypeToSignatures[method.type];
}

export type CurveTokenOption = {
  type: CurveMethodTypes;
  target: string;
  index: number;
  numCoins: number;
  token: TokenEntity;
};
