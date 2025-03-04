import type { TokenEntity } from '../../../../entities/token.ts';

export type CurveMethodTypes =
  | 'fixed'
  | 'fixed-deposit-int128'
  | 'fixed-deposit-uint256'
  | 'fixed-deposit-underlying'
  | 'dynamic-deposit'
  | 'pool-fixed'
  | 'pool-fixed-deposit'
  | 'pool-dynamic-deposit';

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
    withdrawQuote: 'calc_withdraw_one_coin:amount/uint256_index',
    withdraw: 'remove_liquidity_one_coin:amount/uint256_index/min_amount',
  },
  'fixed-deposit-int128': {
    depositQuote: 'calc_token_amount:fixed_amounts/is_deposit',
    deposit: 'add_liquidity:fixed_amounts/min_amount',
    withdrawQuote: 'calc_withdraw_one_coin:amount/int128_index',
    withdraw: 'remove_liquidity_one_coin:amount/int128_index/min_amount',
  },
  'fixed-deposit-uint256': {
    depositQuote: 'calc_token_amount:fixed_amounts/is_deposit',
    deposit: 'add_liquidity:fixed_amounts/min_amount',
    withdrawQuote: 'calc_withdraw_one_coin:amount/uint256_index',
    withdraw: 'remove_liquidity_one_coin:amount/uint256_index/min_amount',
  },
  'fixed-deposit-underlying': {
    depositQuote: 'calc_token_amount:fixed_amounts/is_deposit',
    deposit: 'add_liquidity:fixed_amounts/min_amount/use_underlying',
    withdrawQuote: 'calc_withdraw_one_coin:amount/int128_index',
    withdraw: 'remove_liquidity_one_coin:amount/int128_index/min_amount/use_underlying',
  },
  'dynamic-deposit': {
    depositQuote: 'calc_token_amount:dynamic_amounts/is_deposit',
    deposit: 'add_liquidity:dynamic_amounts/min_amount',
    withdrawQuote: 'calc_withdraw_one_coin:amount/int128_index',
    withdraw: 'remove_liquidity_one_coin:amount/int128_index/min_amount',
  },
  'pool-fixed': {
    depositQuote: 'calc_token_amount:pool/fixed_amounts',
    deposit: 'add_liquidity:pool/fixed_amounts/min_amount',
    withdrawQuote: 'calc_withdraw_one_coin:pool/amount/uint256_index',
    withdraw: 'remove_liquidity_one_coin:pool/amount/uint256_index/min_amount',
  },
  'pool-fixed-deposit': {
    depositQuote: 'calc_token_amount:pool/fixed_amounts/is_deposit',
    deposit: 'add_liquidity:pool/fixed_amounts/min_amount',
    withdrawQuote: 'calc_withdraw_one_coin:pool/amount/int128_index',
    withdraw: 'remove_liquidity_one_coin:pool/amount/int128_index/min_amount',
  },
  'pool-dynamic-deposit': {
    depositQuote: 'calc_token_amount:pool/dynamic_amounts/is_deposit',
    deposit: 'add_liquidity:pool/dynamic_amounts/min_amount',
    withdrawQuote: 'calc_withdraw_one_coin:pool/amount/int128_index',
    withdraw: 'remove_liquidity_one_coin:pool/amount/int128_index/min_amount',
  },
} as const satisfies Record<CurveMethodTypes, CurveMethodSignatures>;

export type CurveMethodTypeToSignaturesMap = typeof curveMethodTypeToSignatures;

type MakeCurveMethod<T extends CurveMethodTypes> = {
  type: T;
  target: string;
  coins: string[];
};

type CurveMethodFixed = MakeCurveMethod<'fixed'>;
type CurveMethodFixedDepositInt128 = MakeCurveMethod<'fixed-deposit-int128'>;
type CurveMethodFixedDepositUint256 = MakeCurveMethod<'fixed-deposit-uint256'>;
type CurveMethodFixedDepositUnderlying = MakeCurveMethod<'fixed-deposit-underlying'>;
type CurveMethodDynamicDeposit = MakeCurveMethod<'dynamic-deposit'>;
type CurveMethodPoolFixed = MakeCurveMethod<'pool-fixed'>;
type CurveMethodPoolFixedDeposit = MakeCurveMethod<'pool-fixed-deposit'>;
type CurveMethodPoolDynamicDeposit = MakeCurveMethod<'pool-dynamic-deposit'>;

export type CurveMethod =
  | CurveMethodFixed
  | CurveMethodFixedDepositInt128
  | CurveMethodFixedDepositUint256
  | CurveMethodFixedDepositUnderlying
  | CurveMethodDynamicDeposit
  | CurveMethodPoolFixed
  | CurveMethodPoolFixedDeposit
  | CurveMethodPoolDynamicDeposit;

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

export type CurveTokenOption<T extends CurveMethodTypes = CurveMethodTypes> = {
  type: T;
  target: string;
  index: number;
  numCoins: number;
  token: TokenEntity;
};
