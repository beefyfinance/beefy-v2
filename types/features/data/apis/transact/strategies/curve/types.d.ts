import type { TokenEntity } from '../../../../entities/token';
export type CurveMethodTypes = 'fixed' | 'fixed-deposit-int128' | 'fixed-deposit-uint256' | 'fixed-deposit-underlying' | 'dynamic-deposit' | 'pool-fixed' | 'pool-fixed-deposit' | 'pool-dynamic-deposit';
declare const curveMethodTypeToSignatures: {
    readonly fixed: {
        readonly depositQuote: "calc_token_amount:fixed_amounts";
        readonly deposit: "add_liquidity:fixed_amounts/min_amount";
        readonly withdrawQuote: "calc_withdraw_one_coin:amount/uint256_index";
        readonly withdraw: "remove_liquidity_one_coin:amount/uint256_index/min_amount";
    };
    readonly 'fixed-deposit-int128': {
        readonly depositQuote: "calc_token_amount:fixed_amounts/is_deposit";
        readonly deposit: "add_liquidity:fixed_amounts/min_amount";
        readonly withdrawQuote: "calc_withdraw_one_coin:amount/int128_index";
        readonly withdraw: "remove_liquidity_one_coin:amount/int128_index/min_amount";
    };
    readonly 'fixed-deposit-uint256': {
        readonly depositQuote: "calc_token_amount:fixed_amounts/is_deposit";
        readonly deposit: "add_liquidity:fixed_amounts/min_amount";
        readonly withdrawQuote: "calc_withdraw_one_coin:amount/uint256_index";
        readonly withdraw: "remove_liquidity_one_coin:amount/uint256_index/min_amount";
    };
    readonly 'fixed-deposit-underlying': {
        readonly depositQuote: "calc_token_amount:fixed_amounts/is_deposit";
        readonly deposit: "add_liquidity:fixed_amounts/min_amount/use_underlying";
        readonly withdrawQuote: "calc_withdraw_one_coin:amount/int128_index";
        readonly withdraw: "remove_liquidity_one_coin:amount/int128_index/min_amount/use_underlying";
    };
    readonly 'dynamic-deposit': {
        readonly depositQuote: "calc_token_amount:dynamic_amounts/is_deposit";
        readonly deposit: "add_liquidity:dynamic_amounts/min_amount";
        readonly withdrawQuote: "calc_withdraw_one_coin:amount/int128_index";
        readonly withdraw: "remove_liquidity_one_coin:amount/int128_index/min_amount";
    };
    readonly 'pool-fixed': {
        readonly depositQuote: "calc_token_amount:pool/fixed_amounts";
        readonly deposit: "add_liquidity:pool/fixed_amounts/min_amount";
        readonly withdrawQuote: "calc_withdraw_one_coin:pool/amount/uint256_index";
        readonly withdraw: "remove_liquidity_one_coin:pool/amount/uint256_index/min_amount";
    };
    readonly 'pool-fixed-deposit': {
        readonly depositQuote: "calc_token_amount:pool/fixed_amounts/is_deposit";
        readonly deposit: "add_liquidity:pool/fixed_amounts/min_amount";
        readonly withdrawQuote: "calc_withdraw_one_coin:pool/amount/int128_index";
        readonly withdraw: "remove_liquidity_one_coin:pool/amount/int128_index/min_amount";
    };
    readonly 'pool-dynamic-deposit': {
        readonly depositQuote: "calc_token_amount:pool/dynamic_amounts/is_deposit";
        readonly deposit: "add_liquidity:pool/dynamic_amounts/min_amount";
        readonly withdrawQuote: "calc_withdraw_one_coin:pool/amount/int128_index";
        readonly withdraw: "remove_liquidity_one_coin:pool/amount/int128_index/min_amount";
    };
};
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
export type CurveMethod = CurveMethodFixed | CurveMethodFixedDepositInt128 | CurveMethodFixedDepositUint256 | CurveMethodFixedDepositUnderlying | CurveMethodDynamicDeposit | CurveMethodPoolFixed | CurveMethodPoolFixedDeposit | CurveMethodPoolDynamicDeposit;
export declare function getMethodSignaturesForType<T extends CurveMethodTypes>(type: T): CurveMethodTypeToSignaturesMap[T];
export declare function getCurveMethodsSignatures<T extends CurveMethodTypes>(method: MakeCurveMethod<T>): CurveMethodTypeToSignaturesMap[T];
export type CurveTokenOption<T extends CurveMethodTypes = CurveMethodTypes> = {
    type: T;
    target: string;
    index: number;
    numCoins: number;
    token: TokenEntity;
};
export {};
